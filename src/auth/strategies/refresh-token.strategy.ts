// src/auth/strategies/refresh-token.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET!, // ใช้ ! เพื่อยืนยันว่ามีค่าแน่ๆ
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken, // ส่งค่านี้ออกไปให้ req.user
    };
  }
}
