import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Label } from 'src/label/entities/label.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from 'src/common/enum/role.enum';
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
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

  async findAll(
    queryOptions: { page: number; limit: number; search?: string },
    req: RequestWithUser,
  ) {
    const { page, limit, search } = queryOptions;
    const skip = (page - 1) * limit;
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.labels', 'labels')
      .addSelect(['labels.id', 'labels.name', 'labels.color'])
      .leftJoin('task.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.name'])
      .leftJoin('task.owner', 'owner')
      .addSelect(['owner.id', 'owner.name', 'owner.email']);

    if (req.user.role === 'admin') {
      query.andWhere(
        '(task.owner_id = :userId OR task.assignee_id = :userId)',
        { userId: req.user.userId },
      );
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }, // ILIKE สำหรับ Postgres (Case-insensitive)
      );
    }

    // 4. Pagination & Sorting
    query.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
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
