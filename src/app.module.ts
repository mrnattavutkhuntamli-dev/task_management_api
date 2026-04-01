import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';
import { LabelModule } from './label/label.module';

@Module({
  imports: [UsersModule, TaskModule, LabelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
