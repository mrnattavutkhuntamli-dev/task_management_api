import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Label } from './entities/label.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
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

  findOne(id: number) {
    return `This action returns a #${id} label`;
  }

  update(id: number, updateLabelDto: UpdateLabelDto) {
    return `This action updates a #${id} label`;
  }

  remove(id: number) {
    return `This action removes a #${id} label`;
  }
}
