import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords
import { Task } from 'src/task/entities/task.entity';
import { Label } from 'src/label/entities/label.entity';
import { Comment } from 'src/task/entities/comment.entity';
import { Exclude } from 'class-transformer';
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude() //
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Exclude() //
  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => Task, (task) => task.owner)
  ownedTasks: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Label, (label) => label.user)
  labels: Label[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
