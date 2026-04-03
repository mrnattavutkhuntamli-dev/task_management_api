import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Label } from 'src/label/entities/label.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async create(createTaskDto: CreateTaskDto, ownerId: string) {
    const { labelIds, ...taskData } = createTaskDto;
    console.log(labelIds);
    console.log(taskData);
    console.log(ownerId);
    // สร้าง Instance ของ task พร้อมผูก ownerId ว่าใครเป็นเจ้าของ
    const task = this.taskRepository.create({
      ...taskData,
      ownerId,
    });
    // 2. ถ้ามี labelIds ส่งมา ให้ไปดึง Entity ของ Label มาใส่
    if (labelIds && labelIds.length > 0) {
      // สร้าง Instance ของ label พร้อมผูก labelIds ว่าใครเป็นเจ้าของ
      task.labels = await this.labelRepository.findBy({
        id: In(labelIds),
      });
    }
    // 3. บันทึกลง Database (TypeORM จะจัดการตารางกลาง task_labels ให้เอง)
    return await this.taskRepository.save(task);
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
