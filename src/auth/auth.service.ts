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
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: forgetPasswordDto.email,
      subject: 'รีเซ็ตรหัสผ่านสำหรับ Nak Drive',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>คุณต้องการรีเซ็ตรหัสผ่านใช่หรือไม่?</h2>
          <p>คลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้มีอายุ 15 นาที):</p>
          <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ตั้งรหัสผ่านใหม่
          </a>
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
