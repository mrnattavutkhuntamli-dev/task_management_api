import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO สำหรับการเปลี่ยนรหัสผ่าน (ขณะที่ Login อยู่)
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านเดิม' })
  oldPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  newPassword!: string;
}
