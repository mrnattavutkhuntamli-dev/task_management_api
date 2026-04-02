import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // บรรทัดนี้สำคัญที่สุด!
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // บรรทัดนี้สำคัญที่สุด!
})
export class UsersModule {}
