import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Label } from 'src/label/entities/label.entity';
import { User } from 'src/users/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment, Attachment, Label, User])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TypeOrmModule],
})
export class TaskModule {}
