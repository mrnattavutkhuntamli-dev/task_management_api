import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // ชื่อไฟล์เดิม
  filename: string;

  @Column() // Path ที่เก็บไฟล์ เช่น /uploads/tasks/xxx.png
  url: string;

  @Column()
  mimetype: string; // ประเภทไฟล์ เช่น image/png, application/pdf

  @Column({
    type: 'enum',
    enum: ['file', 'link'],
    default: 'file',
  })
  type: 'file' | 'link';

  @Column({ nullable: true }) // 💡 เก็บขนาดไฟล์ (Bytes) ไว้โชว์ที่หน้าบ้านได้ (ถ้าเป็นไฟล์)
  size: number;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: string;

  @CreateDateColumn()
  createdAt: Date;
}
