import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/task/entities/task.entity';
@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id: number; // Label ใช้เป็น number ตามที่คุณวางแผนไว้

  @Column()
  name: string;

  @Column({ default: '#ffffff' })
  color: string;

  // แก้ไขตรงนี้: เพิ่ม type : User เพื่อให้ TS มั่นใจ
  @ManyToOne(() => User, (user: User) => user.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string; // UUID จาก User

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[];
}
