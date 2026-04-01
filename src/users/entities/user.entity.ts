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
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ unique: true })
  email: string;

  // select: false → password จะไม่ถูก SELECT ออกมาโดย default
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  // Refresh token เก็บแบบ hashed
  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  // TASK มีความสัมพันธ์ที่เก็บไปยัง USER ของ TASK และ OWNER ของ TASK
  @OneToMany(() => Task, (task) => task.owner)
  ownedTasks: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Label, (label) => label.user)
  labels: Label[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Hash password ก่อน insert/update อัตโนมัติ
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      // ตรวจสอบว่าถูก Hash ไปหรือยัง
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
