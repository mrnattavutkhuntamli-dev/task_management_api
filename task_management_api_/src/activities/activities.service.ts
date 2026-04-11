import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async log(data: {
    action: string;
    entityId: string;
    oldData?: Record<string, unknown>; // ตรงนี้คือประกาศ Type (ใช้เครื่องหมาย ?)
    newData?: Record<string, unknown>;
    userId: string;
  }) {
    const activity = this.activityRepository.create({
      action: data.action,
      entityId: data.entityId,
      oldData: data.oldData,
      newData: data.newData,
      performedBy: { id: data.userId } as User,
    });
    return await this.activityRepository.save(activity);
  }
}
