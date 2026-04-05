import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString({ message: 'เนื้อหาคอมเมนต์ต้องเป็นข้อความเท่านั้น' })
  @IsNotEmpty({ message: 'กรุณากรอกเนื้อหาคอมเมนต์' })
  @MinLength(1, { message: 'คอมเมนต์ต้องมีความยาวอย่างน้อย 1 ตัวอักษร' })
  @MaxLength(1000, { message: 'คอมเมนต์ต้องมีความยาวไม่เกิน 1,000 ตัวอักษร' })
  body: string;
}
