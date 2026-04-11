import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  IsNumber,
} from 'class-validator';
export class CreateTaskDto {
  @IsNotEmpty({ message: 'กรุณาระบุหัวข้องาน' })
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber() // 💡 เปลี่ยนจาก Enum เป็น Number
  statusId?: number;

  @IsOptional()
  @IsNumber() // 💡 เปลี่ยนจาก Enum เป็น Number
  priorityId?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsUUID()
  assigneeId?: string; // 💡 ส่งแค่ ID พนักงานที่จะรับงานมาก็พอ

  @IsOptional()
  @IsUUID(undefined, { each: true })
  labelIds?: string[]; // 💡 ส่งอาเรย์ของ ID Label มา
}
