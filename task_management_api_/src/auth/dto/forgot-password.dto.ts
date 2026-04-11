import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO สำหรับการเข้าสู่ระบบ
 */
export class Forgot_passwordDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email!: string;
}
