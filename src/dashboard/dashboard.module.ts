import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Task])], // บรรทัดนี้สำคัญที่สุด!
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
