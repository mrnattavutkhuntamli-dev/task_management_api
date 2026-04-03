import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsHexColor,
  MaxLength,
} from 'class-validator';
export class CreateLabelDto {
  @IsNotEmpty({ message: 'ชื่อ Label ห้ามว่าง' })
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsHexColor({ message: 'รูปแบบสีต้องเป็น Hex Color เช่น #FFFFFF' })
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
