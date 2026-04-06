import { Injectable } from '@nestjs/common';
import { CreatePriorityTaskDto } from './dto/create-priority_task.dto';
import { UpdatePriorityTaskDto } from './dto/update-priority_task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PriorityTask } from './entities/priority_task.entity';

import { Repository } from 'typeorm';
import { Task } from '../task/entities/task.entity';

// สร้าง interface  MaxSortOrderResult เพื่อป้องกันข้อมูลจาก Database (มักเป็น string) ให้เป็น number
interface MaxSortOrderResult {
  max: string | null;
}
@Injectable()
export class PriorityTaskService {
  constructor(
    @InjectRepository(PriorityTask)
    private readonly priorityRepository: Repository<PriorityTask>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  create(createPriorityTaskDto: CreatePriorityTaskDto) {
    console.log(createPriorityTaskDto);
    return 'This action adds a new priorityTask';
  }

  findAll() {
    return `This action returns all priorityTask`;
  }

  findOne(id: number) {
    return `This action returns a #${id} priorityTask`;
  }

  update(id: number, updatePriorityTaskDto: UpdatePriorityTaskDto) {
    return `This action updates a #${id} priorityTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} priorityTask`;
  }
}
