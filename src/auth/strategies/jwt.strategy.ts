import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 💡 1. ต้อง Import ConfigService มาด้วย
// 💡 สร้าง Interface เพื่อบอกว่าใน Token ของเรามีข้อมูลอะไรบ้าง
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  // หลังจากผ่านการตรวจสอบ Token แล้ว ข้อมูลใน Payload จะถูกส่งมาที่นี่
  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
