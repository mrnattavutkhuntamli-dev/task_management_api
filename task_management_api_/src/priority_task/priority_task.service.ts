import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePriorityTaskDto } from './dto/create-priority_task.dto';
import { UpdatePriorityTaskDto } from './dto/update-priority_task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PriorityTask } from './entities/priority_task.entity';

import { Repository } from 'typeorm';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class PriorityTaskService {
  constructor(
    @InjectRepository(PriorityTask)
    private readonly priorityRepository: Repository<PriorityTask>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  async create(createPriorityTaskDto: CreatePriorityTaskDto) {
    const { key } = createPriorityTaskDto;
    const existPriorityTask = await this.priorityRepository.findOne({
      where: { key },
    });
    if (existPriorityTask) {
      throw new Error('มีอยู่กิจกรรมการจัดลำดับความสำคัญมากขึ้น');
    }
    const priorityTask = this.priorityRepository.create(createPriorityTaskDto);
    return await this.priorityRepository.save(priorityTask);
  }

  findAll() {
    return this.priorityRepository.find({
      order: {
        level: 'ASC', // 💡 ASC = 1, 2, 3... (ด่วนสุดขึ้นก่อน)
      },
    });
  }

  async findOne(id: number) {
    const priority = await this.priorityRepository.findOne({
      where: { id },
    });

    if (!priority) {
      throw new NotFoundException(`ไม่พบ Priority ID: ${id}`);
    }

    return priority;
  }

  async update(id: number, updatePriorityTaskDto: UpdatePriorityTaskDto) {
    // 1. ค้นหาข้อมูลเดิมก่อน
    const priority = await this.priorityRepository.findOne({ where: { id } });
    if (!priority) {
      throw new NotFoundException(`ไม่พบ Priority ID: ${id}`);
    }

    // 2. ถ้ามีการเปลี่ยน key ต้องเช็คว่าไปซ้ำกับตัวอื่นไหม
    if (
      updatePriorityTaskDto.key &&
      updatePriorityTaskDto.key !== priority.key
    ) {
      const existingKey = await this.priorityRepository.findOne({
        where: { key: updatePriorityTaskDto.key },
      });
      if (existingKey) {
        throw new BadRequestException(
          `Key "${updatePriorityTaskDto.key}" ถูกใช้งานไปแล้ว`,
        );
      }
    }

    // 3. ใช้ .merge() เพื่อรวมร่างข้อมูล (ID และฟิลด์เดิมจะยังอยู่ครบ)
    // 💡 ตัวนี้จะรับค่า level ใหม่จาก DTO ไปทับของเดิมให้เองครับ
    const updatedPriority = this.priorityRepository.merge(
      priority,
      updatePriorityTaskDto,
    );

    // 4. บันทึกการเปลี่ยนแปลง (TypeORM จะทำ SQL UPDATE ให้)
    return await this.priorityRepository.save(updatedPriority);
  }

  async remove(id: number) {
    // 1. เช็คก่อนว่า Priority ID นี้มีตัวตนไหม
    const priority = await this.priorityRepository.findOne({ where: { id } });
    if (!priority) {
      throw new NotFoundException(`ไม่พบ Priority ID: ${id}`);
    }

    // 2. นับจำนวน Task ที่ใช้ Priority นี้อยู่
    const taskCount = await this.taskRepository.count({
      where: { priority: { id } }, // เช็คชื่อ relation ใน Entity ให้ตรงนะครับ (เช่น priority หรือ priorityId)
    });

    if (taskCount === 0) {
      // 🔥 กรณีไม่มีงานผูก: ลบทิ้งถาวร (Hard Delete)
      await this.priorityRepository.delete(id);
      return {
        message: `ลบระดับความสำคัญ "${priority.label}" ถาวรเรียบร้อยแล้ว`,
        type: 'HARD_DELETE',
      };
    } else {
      // 🛡️ กรณีมีงานผูก: ทำ Soft Delete เพื่อรักษาประวัติงานเก่าๆ ไว้
      await this.priorityRepository.softDelete(id);
      return {
        message: `ย้าย "${priority.label}" ไปถังขยะเนื่องจากมีงานค้าง ${taskCount} รายการ`,
        type: 'SOFT_DELETE',
      };
    }
  }
}
