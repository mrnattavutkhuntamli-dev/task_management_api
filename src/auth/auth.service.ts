import { Injectable, UnauthorizedException } from '@nestjs/common';
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
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
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

    // ส่งเมลผ่าน Resend
    const resetUrl = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;
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
}
