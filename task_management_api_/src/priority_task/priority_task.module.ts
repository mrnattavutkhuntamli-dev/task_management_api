import { forwardRef, Module } from '@nestjs/common';
import { PriorityTaskService } from './priority_task.service';
import { PriorityTaskController } from './priority_task.controller';
import { PriorityTask } from './entities/priority_task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from 'src/task/task.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([PriorityTask]),
    forwardRef(() => TaskModule),
  ],
  controllers: [PriorityTaskController],
  providers: [PriorityTaskService],
})
export class PriorityTaskModule {}
