import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';
export class CreateTaskDto {
  @IsNotEmpty({ message: 'กรุณาระบุหัวข้องาน' })
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

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
