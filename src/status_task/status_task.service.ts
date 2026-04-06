import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStatusTaskDto } from './dto/create-status_task.dto';
import { UpdateStatusTaskDto } from './dto/update-status_task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusTask } from './entities/status_task.entity';
import { Task } from '../task/entities/task.entity';
import { Repository } from 'typeorm';

interface MaxSortOrderResult {
  max: string | null;
}
@Injectable()
export class StatusTaskService {
  constructor(
    @InjectRepository(StatusTask)
    private readonly statusTaskRepository: Repository<StatusTask>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  async create(createStatusTaskDto: CreateStatusTaskDto) {
    const { key } = createStatusTaskDto;

    // 1. เช็คความซ้ำซ้อน (Business Logic)
    const existing = await this.statusTaskRepository.findOne({
      where: { key },
    });
    if (existing) {
      throw new BadRequestException(`Key "${key}" มีอยู่ในระบบแล้ว`);
    }

    // 2. คำนวณ Sort Order อัตโนมัติ (ไม่ต้องรับจาก User)
    const result = await this.statusTaskRepository
      .createQueryBuilder('status')
      .select('MAX(status.sortOrder)', 'max')
      .getRawOne<MaxSortOrderResult>(); // 👈 ใช้ Interface ที่สร้างไว้

    // แปลงค่าจาก Database (มักเป็น string) ให้เป็น number
    const maxSortOrder = result?.max ? parseInt(result.max, 10) : 0;
    const newSortOrder = maxSortOrder + 1;

    // 3. บันทึกข้อมูล
    // 💡 ใช้ .create() เพื่อสร้าง Instance ที่สมบูรณ์ก่อน .save()
    const newStatus = this.statusTaskRepository.create({
      ...createStatusTaskDto,
      sortOrder: newSortOrder,
    });

    return await this.statusTaskRepository.save(newStatus);
  }

  findAll() {
    return this.statusTaskRepository.find({ order: { sortOrder: 'ASC' } });
  }

  findOne(id: number) {
    return this.statusTaskRepository.findOne({ where: { id } });
  }

  async update(id: number, updateStatusTaskDto: UpdateStatusTaskDto) {
    // 1. เช็คก่อนว่า ID นี้มีตัวตนจริงไหม
    const status = await this.statusTaskRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`ไม่พบ Status ID: ${id}`);
    }

    // 2. ถ้ามีการแก้ไข key ต้องเช็คว่า key ใหม่ไปซ้ำกับคนอื่นไหม
    if (updateStatusTaskDto.key && updateStatusTaskDto.key !== status.key) {
      const existingKey = await this.statusTaskRepository.findOne({
        where: { key: updateStatusTaskDto.key },
      });
      if (existingKey) {
        throw new BadRequestException(
          `Key "${updateStatusTaskDto.key}" มีผู้ใช้งานแล้ว`,
        );
      }
    }
    // 3. รวมร่างข้อมูล (Merge)
    // เราใช้ .assign หรือแผ่ค่าลงไปใน object เดิม เพื่อรักษา ID และ sortOrder เดิมไว้
    const updatedStatus = this.statusTaskRepository.merge(
      status,
      updateStatusTaskDto,
    );
    // 4. บันทึก (จะกลายเป็นการ SQL UPDATE อัตโนมัติเพราะมี ID อยู่แล้ว)
    return await this.statusTaskRepository.save(updatedStatus);
  }

  async remove(id: number) {
    const status = await this.statusTaskRepository.findOne({
      where: { id: id },
    });
    if (!status) {
      throw new NotFoundException(`ไม่พบ Status ID: ${id}`);
    }

    const taskCount = await this.taskRepository.count({
      where: { statusId: id },
    });
    if (taskCount === 0) {
      // กรณีไม่มีงานค้าง ลบทิ้งภาวร
      await this.statusTaskRepository.delete(id);
      return {
        message: `ลบสถานะ "${status.label}" ถาวรเรียบร้อยแล้ว`,
        type: 'HARD_DELETE',
      };
    } else {
      await this.statusTaskRepository.softDelete(id);
      return {
        message: `สถานะ "${status.label}" ถูกย้ายไปถังขยะเนื่องจากมีงานค้าง ${taskCount} รายการ`,
        type: 'SOFT_DELETE',
      };
    }
  }
}
