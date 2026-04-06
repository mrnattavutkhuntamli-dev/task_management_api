import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePriorityTaskDto {
  @ApiProperty({
    example: 'in_progress',
    description: 'Unique key (แนะนำ snake_case) สำหรับใช้เช็ค Logic หลังบ้าน',
  })
  @IsString()
  @IsNotEmpty()
  // @IsLowercase() // 💡 เพิ่มเพื่อให้ data consistency สวยงาม
  key: string;

  @ApiProperty({
    example: 'กำลังดำเนินการ',
    description: 'ชื่อภาษาไทยสำหรับแสดงผล',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: '#3b82f6',
    description: 'รหัสสี Hex (Tailwind default หรือ Hex code)',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}
