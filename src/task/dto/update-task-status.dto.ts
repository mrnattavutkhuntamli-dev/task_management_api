import { IsEnum, IsNotEmpty } from 'class-validator';

// 💡 แนะนำให้แยก Enum ไว้ที่ไฟล์ entity หรือ constants เพื่อให้เรียกใช้ได้ทั้งโปรเจกต์
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELED = 'canceled',
}

export class UpdateTaskStatusDto {
  @IsNotEmpty({ message: 'กรุณาระบุสถานะงาน' })
  @IsEnum(TaskStatus, {
    message: 'สถานะต้องเป็น todo, in_progress, done หรือ canceled เท่านั้น',
  })
  status: TaskStatus;
}
