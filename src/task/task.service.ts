import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Label } from 'src/label/entities/label.entity';
import { Attachment } from './entities/attachement.entity';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTaskCommentDto } from './dto/create-task-comment';
import { UpdateTaskCommentDto } from './dto/update-task-comment';
import { deletePhysicalFiles } from 'src/common/utils/file-upload.utils';
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

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async create(createTaskDto: CreateTaskDto, ownerId: string) {
    const { labelIds, ...taskData } = createTaskDto;

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

  async createcomment(
    taskId: string,
    authorId: string,
    createCommentDto: CreateTaskCommentDto,
  ) {
    // ค้นหา Taks ที่ต้องการสร้างความเห็นได้
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`ไม่พบงานรหัส: ${taskId}`);
    }
    // สร้าง Comment ให้มี authorId และ body
    const comment = this.commentRepository.create({
      body: createCommentDto.body,
      taskId: task.id,
      authorId,
    });
    // บันทึกลง Database (TypeORM จะจัดการตารางกลาง task_comments ให้เอง)
    const savecomment = await this.commentRepository.save(comment);

    return await this.commentRepository.findOne({
      where: { id: savecomment.id },
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findAll(
    queryOptions: { page: number; limit: number; search?: string },
    req: RequestWithUser,
  ) {
    const { page, limit, search } = queryOptions;
    const skip = (page - 1) * limit;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task.id',
        'task.title',
        'task.status',
        'task.priority',
        'task.dueDate',
        'task.createdAt',
      ])
      .leftJoin('task.labels', 'labels')
      .addSelect(['labels.id', 'labels.name', 'labels.color'])
      .leftJoin('task.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.name'])
      .leftJoin('task.owner', 'owner')
      .addSelect(['owner.id', 'owner.name', 'owner.email']);

    if (req.user.role !== 'admin') {
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

  async findOne(id: string, req: RequestWithUser) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task.id',
        'task.title',
        'task.description',
        'task.status',
        'task.priority',
        'task.dueDate',
        'task.createdAt',
      ])
      .leftJoin('task.labels', 'labels')
      .addSelect(['labels.id', 'labels.name', 'labels.color'])
      // 💬 Deep Join Comments > Author
      .leftJoin('task.comments', 'comments')
      .addSelect(['comments.id', 'comments.body', 'comments.createdAt'])
      .addOrderBy('comments.createdAt', 'DESC')
      .leftJoin('comments.author', 'author')
      .addSelect(['author.id', 'author.name', 'author.avatar'])
      // 📎 Join Attachments
      .leftJoin('task.attachments', 'attachments')
      .addSelect([
        'attachments.id',
        'attachments.filename',
        'attachments.url',
        'attachments.mimetype',
        'attachments.size',
      ])

      .leftJoin('task.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.name', 'assignee.avatar'])
      .leftJoin('task.owner', 'owner')
      .addSelect(['owner.id', 'owner.name', 'owner.email'])
      .where('task.id = :id', { id });

    if (req.user.role !== 'admin') {
      query.andWhere(
        '(task.owner_id = :userId OR task.assignee_id = :userId)',
        { userId: req.user.userId },
      );
    }

    const task = await query.getOne();

    if (!task) {
      throw new NotFoundException(
        `ไม่พบงานรหัส: ${id} หรือคุณไม่มีสิทธิ์เข้าถึง`,
      );
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, req: RequestWithUser) {
    // 1. ค้นหาพร้อมโหลด labels มาด้วย (เพื่อเตรียมจัดการ relation)
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
    if (!task) {
      throw new NotFoundException(`ไม่พบงานรหัส: ${id}`);
    }
    // 2. 🔒 Security: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของงาน ห้ามแก้!
    if (req.user.role !== 'admin' && task.ownerId !== req.user.userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขงานนี้');
    }
    const { labelIds, ...updateData } = updateTaskDto;

    // 3. จัดการ Update ข้อมูลทั่วไป
    Object.assign(task, updateData);

    // 4. 🏷️ จัดการ Update Labels (ถ้ามีการส่ง labelIds มา)
    if (labelIds) {
      const labels = await this.labelRepository.findBy({
        id: In(labelIds),
        userId: req.user.userId, // เช็คด้วยว่า label เป็นของเขาจริงไหม
      });
      task.labels = labels;
    }

    return await this.taskRepository.save(task);
  }

  async updateComment(
    commentId: number,
    userId: string,
    updateCommentDto: UpdateTaskCommentDto,
  ) {
    // 1. หาคอมเมนต์ก่อน
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`ไม่พบคอมเมนต์รหัส: ${commentId}`);
    }

    // 2. 🔒 Security: เฉพาะเจ้าของคอมเมนต์เท่านั้นที่แก้ได้ (Admin ก็ไม่ควรแก้คำพูดคนอื่น)
    if (comment.authorId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขข้อความของผู้อื่น');
    }

    // 3. อัปเดตข้อมูล
    if (updateCommentDto.body) {
      comment.body = updateCommentDto.body;
    }

    return await this.commentRepository.save(comment);
  }

  async remove(id: string, req: RequestWithUser) {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException(`ไม่พบงานรหัส: ${id}`);
    }

    if (req.user.role !== 'admin' && task.ownerId !== req.user.userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ลบงานนี้');
    }

    await this.taskRepository.softDelete(id);

    return { message: 'ลบงานสำเร็จเรียบร้อยแล้ว' };
  }

  async removeComment(commentId: number, userId: string, userRole: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`ไม่พบคอมเมนต์รหัส: ${commentId}`);
    }

    // 🔒 Security: เจ้าของคอมเมนต์ลบได้ "หรือ" Admin ก็ลบได้ (เผื่อมีคนพิมพ์คำไม่สุภาพ)
    if (comment.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ลบคอมเมนต์นี้');
    }

    await this.commentRepository.remove(comment);
    return { message: 'ลบคอมเมนต์สำเร็จ' };
  }

  // Attachments
  async addMultipleAttachments(taskId: string, files: Express.Multer.File[]) {
    // 1. Check สิทธิ์: คนที่แนบไฟล์ได้ ต้องเป็นคนที่เกี่ยวข้องกับ Task นั้น (เหมือนตอนทำ Comment)
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      //  ถ้าไม่เจอ task ให้ลบไฟล์ที่ Multer เพิ่งเซฟลงไป disk ทั้นที
      deletePhysicalFiles(files);
      throw new NotFoundException('ไม่พบงานที่ระบุ');
    }

    try {
      const attachmentEntities = files.map((file) => {
        return this.attachmentRepository.create({
          type: 'file',
          filename: file.originalname,
          // 💡 แปลง \\ เป็น / เพื่อให้เปิดผ่าน Browser ได้ทุก OS
          url: file.path.replace(/\\/g, '/'),
          mimetype: file.mimetype,
          size: file.size,
          taskId: taskId,
        });
      });
      return await this.attachmentRepository.save(attachmentEntities);
    } catch (error) {
      deletePhysicalFiles(files);
      throw new BadRequestException(
        'ไม่สามารถบันทึกข้อมูลไฟล์ลงฐานข้อมูลได้',
        error,
      );
    }
  }

  async removeAttachment(id: number, userId: string) {
    // 1. ดึง Attachment พร้อมข้อมูล Task เพื่อเช็คสิทธิ์
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id },
      relations: ['task'], // 💡 ดึงความสัมพันธ์ task มาด้วย
    });

    if (!attachment) {
      throw new NotFoundException('ไม่พบไฟล์ที่ระบุ');
    }

    // 💡 2. Check สิทธิ์: คนลบต้องเป็นเจ้าของ Task นั้น (สมมติใน Task มีฟิลด์ ownerId)
    // หรือถ้ากอล์ฟมี Logic อื่น เช่น Admin ลบได้หมด ก็ใส่เพิ่มตรงนี้ครับ
    if (attachment.task.ownerId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ลบไฟล์ในงานนี้');
    }

    // 3. ลบใน Database ก่อน
    await this.attachmentRepository.remove(attachment);

    // 4. ลบไฟล์จริง (เฉพาะประเภท 'file')
    if (attachment.type === 'file') {
      deletePhysicalFiles([attachment.url]);
    }

    return { success: true, message: 'ลบไฟล์เรียบร้อยแล้ว' };
  }
}
