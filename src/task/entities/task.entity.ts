import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  @Index() // สร้าง index เพื่อ query เร็วขึ้น
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // Many-to-One: หลาย tasks เป็นของ user คนเดียว
  @ManyToOne(() => User, (user) => user.ownedTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  // Optional assignee
  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: number;

  // Many-to-Many: task มีได้หลาย labels, label มีได้หลาย tasks
  @ManyToMany(() => Label, { cascade: true, eager: false })
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels: Label[];

  // One-to-Many: task มีได้หลาย comments
  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: true,
  })
  attachments: Attachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
