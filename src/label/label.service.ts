import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Label } from './entities/label.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitiesService } from 'src/activities/activities.service'; // อย่าลืม import
@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    private readonly activitiesService: ActivitiesService, // ต้องเพิ่มใน constructor
  ) {}
  async create(createLabelDto: CreateLabelDto, userId: string) {
    const existingLabel = await this.labelRepository.findOne({
      where: { name: createLabelDto.name, userId: userId },
    });
    if (existingLabel) {
      throw new BadRequestException('มีชื่อนี้อยู่แล้ว');
    }
    const label = this.labelRepository.create({
      ...createLabelDto,
      userId,
    });
    return await this.labelRepository.save(label);
  }

  async findAll(userId: string) {
    return await this.labelRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
  findOne(id: string) {
    return this.labelRepository.findOne({ where: { id } });
  }

  async update(userId: string, id: string, updateLabelDto: UpdateLabelDto) {
    // 1. ต้องใส่ await หน้า findOne ไม่งั้น label จะเป็น Promise (ทำให้ if ไม่ทำงาน)
    const label = await this.labelRepository.findOne({ where: { id } });

    if (!label) {
      throw new NotFoundException(`ไม่พบ Label ID: ${id}`);
    }

    // 2. เก็บข้อมูลเก่าไว้ทำ Log
    const oldData = { ...label };

    try {
      Object.assign(label, updateLabelDto);
      const updatedLabel = await this.labelRepository.save(label);

      // 3. บันทึก Activity Log
      await this.activitiesService.log({
        action: 'LABEL_UPDATE',
        entityId: id,
        oldData: oldData as Record<string, unknown>,
        newData: updateLabelDto as any,
        userId: userId,
      });

      return updatedLabel;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูล Label ได้');
    }
  }

  async remove(id: string, userId: string) {
    const label = await this.labelRepository.findOne({ where: { id } });

    if (!label) {
      throw new NotFoundException(`ไม่พบ Label ID: ${id}`);
    }

    const oldData = { ...label };

    try {
      await this.labelRepository.remove(label);

      // เพิ่ม Log ตอนลบ
      await this.activitiesService.log({
        action: 'LABEL_DELETE',
        entityId: id,
        oldData: oldData as Record<string, unknown>,
        newData: {},
        userId: userId,
      });

      return { message: 'ลบป้ายกำกับเรียบร้อยแล้ว' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ไม่สามารถลบ Label ได้');
    }
  }
}
