import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../task/entities/task.entity';
@Entity('status_task')
export class StatusTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // เช่น 'todo', 'in_progress', 'done' (เอาไว้เช็คใน Logic)

  @Column()
  label: string; // เช่น 'รอดำเนินการ', 'กำลังทำ' (เอาไว้โชว์หน้าบ้าน)

  @Column({ default: '#6b7280' })
  color: string; // เช่น '#ef4444' (ส่งให้ Tailwind/CSS ใช้ได้เลย)

  @Column({ default: 0 })
  sortOrder: number; // เอาไว้เรียงลำดับใน UI

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];
}
