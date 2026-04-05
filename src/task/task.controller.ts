import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  allFileFilter,
  destinationPath,
  editFileName,
} from 'src/common/utils/file-upload.utils';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTaskCommentDto } from './dto/create-task-comment';
import { UpdateTaskCommentDto } from './dto/update-task-comment';
import { diskStorage } from 'multer';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('task')
@UseGuards(JwtAuthGuard) // 🔒 มั่นใจว่าต้อง Login ก่อนถึงจะเจอ req.user
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.taskService.findAll({ page, limit, search }, req);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.taskService.findOne(id, req);
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.taskService.create(createTaskDto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser,
  ) {
    return this.taskService.update(id, updateTaskDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.taskService.remove(id, req);
  }

  // Comments

  @Post(':id/comments')
  addComment(
    @Request() req: RequestWithUser,
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateTaskCommentDto,
  ) {
    return this.taskService.createcomment(
      taskId,
      req.user.userId,
      createCommentDto,
    );
  }

  @Patch('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: number,
    @Body() updateTaskCommentDto: UpdateTaskCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.taskService.updateComment(
      commentId,
      req.user.userId,
      updateTaskCommentDto,
    );
  }

  @Delete('comments/:id')
  removeComment(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.taskService.removeComment(id, req.user.userId, req.user.role);
  }

  // Attachments
  @Post(':id/attachments')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      // เปลี่ยนเป็น Files และใส่จำนวนสูงสุด (เช่น 10)
      // ชื่อ Field ใน Postman ต้องชื่อ 'file'
      storage: diskStorage({
        // ตั้งค่าไฟล์ที่จะใช้งานไว้ดูแล้ว
        destination: destinationPath('uploads/tasks'),
        filename: editFileName,
      }),
      fileFilter: allFileFilter,
      limits: { fileSize: 1024 * 1024 * 10 }, // จำกัดขนาดไฟล์ต่อหน่วย 10MB
    }),
  )
  uploadFile(
    @Request() req: RequestWithUser,
    @Param('id') taskId: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์');
    }
    return this.taskService.addMultipleAttachments(taskId, files);
  }

  @Delete('attachments/:id')
  async removeAttachment(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number, // 💡 ใช้ ParseIntPipe เพราะ ID ใน DB ของกอล์ฟเป็น number
  ) {
    // ส่ง userId ไปเช็คสิทธิ์ใน Service ด้วย (เพื่อความปลอดภัย)
    return this.taskService.removeAttachment(id, req.user.userId);
  }
}
