import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [UsersModule, TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
