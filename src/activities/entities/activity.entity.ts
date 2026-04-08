import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  action!: string; // เช่น 'UPDATE_STATUS', 'ASSIGN_TASK', 'UPDATE_PROFILE'

  @Column()
  entityId!: string; // ID ของ Task หรือ User ที่ถูกกระทำ

  @Column({ type: 'jsonb', nullable: true })
  oldData: any; // ข้อมูลก่อนเปลี่ยน

  @Column({ type: 'jsonb', nullable: true })
  newData: any; // ข้อมูลหลังเปลี่ยน

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  performedBy!: User; // ใครเป็นคนทำ (ถ้า User ถูกลบ ให้เซ็ตเป็น NULL แต่ Log ยังอยู่)

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
