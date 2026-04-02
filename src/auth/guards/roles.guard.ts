/**
 * 
 * ไฟล์ Guard (ยามเฝ้าประตู)
ไฟล์นี้สำคัญที่สุด เพราะเป็นคนตัดสินใจว่าจะให้ Request นี้ "ผ่าน" หรือ "โดนไล่กลับ (403)"
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enum/role.enum';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ดึง Roles ที่เราแปะไว้ใน @Roles() ออกมา
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 2. ถ้าไม่ได้ระบุ @Roles ไว้ที่ Route นั้นเลย (แปลว่าเป็น Public หรือต้องการแค่ Login) ให้ผ่านได้เลย
    if (!requiredRoles) {
      return true;
    }

    // 3. ดึงข้อมูล User (ซึ่ง JwtStrategy แปะมาให้ใน Request แล้ว)
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    // 4. ตรวจสอบว่า User มี Role ตรงกับที่กำหนดไว้ไหม
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
    }

    return true;
  }
}
