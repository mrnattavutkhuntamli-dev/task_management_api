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
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Label } from 'src/label/entities/label.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachement.entity';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  // Owner Relationship
  @ManyToOne(() => User, (user) => user.ownedTasks, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Index()
  @Column({ name: 'owner_id' })
  ownerId: string; // ต้องเป็น string เพื่อ match กับ User UUID

  // Assignee Relationship
  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Index()
  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: string;

  // Labels Many-to-Many
  @ManyToMany(() => Label, (label) => label.tasks, { onDelete: 'CASCADE' }) // ถ้าลบ task ให้ความสัมพันธ์ในตารางกลางหายไป
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' },
  })
  labels: Label[];

  @OneToMany(() => Comment, (comment) => comment.task, {
    cascade: ['insert', 'update'],
  })
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: ['insert', 'update'],
  })
  attachments: Attachment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', select: false })
  deletedAt: Date;
}
