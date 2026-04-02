import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
