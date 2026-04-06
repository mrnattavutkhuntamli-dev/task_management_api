import { forwardRef, Module } from '@nestjs/common';
import { StatusTaskService } from './status_task.service';
import { StatusTaskController } from './status_task.controller';
import { StatusTask } from './entities/status_task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from 'src/task/task.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([StatusTask]),
    forwardRef(() => TaskModule),
  ],
  controllers: [StatusTaskController],
  providers: [StatusTaskService],
})
export class StatusTaskModule {}
