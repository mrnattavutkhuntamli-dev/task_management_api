import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { Repository } from 'typeorm';

// 🟦 Interface สำหรับคุม Type (ป้องกันเส้นแดง)
interface DashboardStat {
  key: string;
  label: string;
  color?: string;
  count: string | number;
}

interface TrendStat {
  date: string;
  created: string | number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getDashboardData() {
    // 1. ดึงข้อมูลจาก Database พร้อมกัน
    const [statusStats, priorityStats, trends, totalTasks] = await Promise.all([
      this.getStatusDistribution() as Promise<DashboardStat[]>,
      this.getPriorityDistribution() as Promise<DashboardStat[]>,
      this.getWeeklyTrends(),
      this.taskRepository.count(),
    ]);

    // 2. ปรับปรุง Logic การคำนวณ Metrics (เช็คจาก key ที่กอล์ฟส่งมา)
    const completedTasks =
      statusStats.find((s) => s.key === 'done')?.count || 0;
    const inProgressTasks =
      statusStats.find((s) => s.key === 'in_progress')?.count || 0;
    const inReviewTasks =
      statusStats.find((s) => s.key === 'in_review')?.count || 0;
    const todoTasks = statusStats.find((s) => s.key === 'todo')?.count || 0;

    // คำนวณ Efficiency Rate
    const efficiencyRate =
      totalTasks > 0
        ? ((Number(completedTasks) / totalTasks) * 100).toFixed(1)
        : '0.0';

    return {
      metrics: {
        totalTasks,
        completedTasks: Number(completedTasks),
        inProgressTasks: Number(inProgressTasks),
        inReviewTasks: Number(inReviewTasks),
        todoTasks: Number(todoTasks),
        efficiencyRate: parseFloat(efficiencyRate),
      },
      distribution: {
        byStatus: statusStats.map((s) => ({ ...s, count: Number(s.count) })),
        byPriority: priorityStats.map((p) => ({
          ...p,
          count: Number(p.count),
        })),
      },
      trends: trends.map((t) => ({
        ...t,
        created: Number(t.created),
      })),
    };
  }

  private async getStatusDistribution() {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.status', 'status')
      .select('status.key', 'key') // ดึง key (todo, in_progress, etc.)
      .addSelect('status.label', 'label') // ดึง label (รอดำเนินการ, กำลังทำ, etc.)
      .addSelect('status.color', 'color')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.deletedAt IS NULL')
      .groupBy('status.id, status.key, status.label, status.color')
      .getRawMany();
  }

  private async getPriorityDistribution() {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.priority', 'priority')
      .select('priority.key', 'key')
      .addSelect('priority.label', 'label')
      .addSelect('priority.color', 'color')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.deletedAt IS NULL')
      .groupBy('priority.id, priority.key, priority.label, priority.color')
      .getRawMany();
  }

  private async getWeeklyTrends(): Promise<TrendStat[]> {
    return this.taskRepository.query(`
      SELECT 
        TO_CHAR(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
        COUNT(id) as created
      FROM tasks
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
        AND "deletedAt" IS NULL
      GROUP BY date
      ORDER BY date ASC
    `);
  }
}
