import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/task/entities/task.entity';
@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: '#666666' }) // 💡 เก็บเป็น Hex Color เช่น #FF5733
  color: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[];

  // ใครเป็นคนสร้าง Label นี้ (เผื่อเป็น Label เฉพาะส่วนตัว)
  @ManyToOne(() => User, (user: User) => user.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string; // UUID จาก User

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
