/**
 * DTO สำหรับการเข้าสู่ระบบ
 */
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'ไม่พบ Token สำหรับการรีเซ็ต' })
  token!: string;

  @MinLength(6, { message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
  newPassword!: string;
}
