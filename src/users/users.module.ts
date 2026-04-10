import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfileController } from './profile.controller';
import { ActivitiesModule } from 'src/activities/activities.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), ActivitiesModule], // บรรทัดนี้สำคัญที่สุด!
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService], // บรรทัดนี้สำคัญที่สุด!
})
export class UsersModule {}
