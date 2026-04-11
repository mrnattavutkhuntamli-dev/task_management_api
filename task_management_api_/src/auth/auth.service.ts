import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto'; // ใช้สร้าง Random Token
import { Forgot_passwordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivitiesService } from 'src/activities/activities.service';
import { ConfigService } from '@nestjs/config';
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    refreshToken?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly ActivityService: ActivitiesService,
    private configService: ConfigService,
  ) {}

  async login(logindto: LoginDto) {
    // ตรวจสอบอีเมล์ โดยใช้ ค่าที่ได้รับจาก body ส่ง email ไปยัง findByEmail ที่อยู่ใน users.service เพื่อตรวจสอบมีผู้ใช้นี้หรือไม่
    const user = await this.usersService.findByEmail(logindto.email);
    if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านผิด');
    if (!user.isActive)
      throw new UnauthorizedException(
        'อีเมลนี้ถูกปิดการใช้งาน กรุณาติดต่อเจ้าหน้าที่เพื่อดำเนินการปลดล็อก',
      );
    if (user && bcrypt.compareSync(logindto.password, user.password)) {
      // ส่งค่าที่ได้รับจาก body ส่ง email ไปยัง findByEmail ที่อยู่ใน users.service เพื่อตรวจสอบมีผู้ใช้นี้หรือไม่
      const payload = { sub: user.id, email: user.email, role: user.role };
      console.log(payload);
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    }
    throw new UnauthorizedException('อีเมลหรือรหัสผ่านผิด');
  }

  async changePassword(
    req: RequestWithUser,
    ip: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;
    const userId = req.user.userId;

    // ดึงข้อมูลผู้ใช้ที่มีรหัสผ่านเดียวก่อนจะส่งคำขอให้กับผู้ใช้ที่ได้รับรหัสผ่าน
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('ผู้ใช้ไม่มีรหัสผ่าน');
    }
    const salt = await bcrypt.genSalt(10);
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      // บันทึก log กรณีมีคนพยามยามเดารหัสผ่านเดิม
      await this.ActivityService.log({
        action: 'AUTH_CHANGE_PASSWORD_FAILED',
        entityId: user.id,
        oldData: { ip, reason: ' Wrong old password' },
        newData: {},
        userId: user.id,
      });
      throw new Error(
        'รหัสผ่านเดียวก่อนจะส่งคำขอให้กับผู้ใช้ที่ได้รับรหัสผ่าน',
      );
    }

    // ตรวจสอบรหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม
    if (oldPassword === newPassword) {
      throw new Error('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม');
    }

    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    await this.ActivityService.log({
      action: 'AUTH_CHANGE_PASSWORD_SUCCESS',
      entityId: user.id,
      oldData: { ip },
      newData: { status: 'success' },
      userId: user.id,
    });

    return { message: 'รหัสผ่านของคุณได้ถูกเปลี่ยนแล้ว', type: 'SUCCESS' };
  }

  async forgotPassword(forgetPasswordDto: Forgot_passwordDto) {
    // ตรวจสอบว่ามี User นี้อยู่ในระบบหรือไม่
    const user = await this.usersService.findByEmail(forgetPasswordDto.email);
    if (!user) {
      throw new Error('อีเมลนี้ไม่มีผู้ใช้งานในระบบ');
    }
    // สร้าง token ให้ความปลอดภัยในการรีเซ็ตรหัสผ่านใหม่
    // โดยการสุ่มตัวอักษร 32 ตัว
    const token = crypto.randomBytes(32).toString('hex');

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // การรีเซ็ตรหัสผ่านใหม่จะหมดเวลานาที 10 นาที

    // บันทึกข้อมูลในระบบต่อไปนี้
    await this.usersService.updateResetToken(user.id, token, expires);

    const frontUrl = this.configService.get<string>('FRONT_URL');
    // ส่งเมลผ่าน Resend
    const resetUrl = `${frontUrl}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: forgetPasswordDto.email,
      subject: 'รีเซ็ตรหัสผ่านสำหรับ Nak Drive',
      html: `
        <div style="background-color: #f5f5f5; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; max-width: 480px; margin: 0 auto; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #f5f5f5; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                🔒
              </div>
              <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #111111;">รีเซ็ตรหัสผ่าน</h2>
              <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px 32px 24px;">
              <p style="margin: 0 0 24px; font-size: 14px; color: #555555; line-height: 1.7;">
                คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยต่ออีเมลนี้ได้เลย
              </p>
              <a href="${resetUrl}" style="display: block; text-align: center; background: #111111; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.01em;">
                ตั้งรหัสผ่านใหม่
              </a>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 32px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #888888;">
                ⏱ ลิงก์นี้จะหมดอายุใน <strong style="color: #111111;">15 นาที</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });
    return { message: 'ส่งอีเมลเรียบร้อยแล้ว' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    // ตรวจสอบว่ามี Token นี้อยู่ในระบบหรือไม่
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()), // เช็คว่ารหัสผ่านจะหมดเวลานาทีที่กำหนดไว้ใน Entity
      },
    });
    if (!user) {
      throw new Error('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 4. ⚠️ สำคัญมาก: ล้าง Token ทิ้งหลังจากใช้งานสำเร็จ เพื่อป้องกันการนำ Token เดิมมาใช้ซ้ำ
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;
    // 5. บันทึกลงฐานข้อมูล
    await this.userRepository.save(user);

    return {
      message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    };
  }

  // refreshtoken จะถูกใช้เมื่อคุณต้องการเข้าสู่ระบบใหม่หรือไม่
  async getToken(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m', // สั้นๆ เพื่อความปลอดภัย
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', // อยู่ได้นานหน่อย
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken, // อย่าลืมเพิ่มฟิลด์นี้ใน User Entity นะครับ
    });
  }

  async logout(req: RequestWithUser) {
    // ล้าง Refresh Token ใน DB ทิ้งเพื่อให้ใช้ต่อไม่ได้
    return this.userRepository.update(req.user.userId, { refreshToken: null });
  }

  async refreshTokens(req: RequestWithUser) {
    const payload = {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    };
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      req.user.refreshToken!,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getToken(
      payload.userId,
      payload.email,
      payload.role,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
