import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { User } from 'src/users/entities/user.entity';
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
