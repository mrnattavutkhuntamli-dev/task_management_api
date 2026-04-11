import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('priorities')
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // 'low', 'medium', 'high', 'urgent'

  @Column()
  label: string; // 'ต่ำ', 'ปานกลาง', 'สูง', 'ด่วนที่สุด'

  @Column()
  color: string; // '#ef4444' (แดง), '#3b82f6' (ฟ้า)

  @Column({ type: 'int', default: 1 })
  level: number; // 1=Low, 2=Med, 3=High, 4=Urgent (เอาไว้ Sort งานด่วนขึ้นก่อน)

  @OneToMany(() => Task, (task) => task.priority)
  tasks: Task[];
}
