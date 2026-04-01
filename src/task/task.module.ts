import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment, Attachment])],
  controllers: [TaskController],
  providers: [TaskService, Comment, Attachment],
})
export class TaskModule {}
