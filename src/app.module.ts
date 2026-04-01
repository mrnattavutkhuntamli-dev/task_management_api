import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';
import { LabelModule } from './label/label.module';

@Module({
  imports: [
    //1. โหลดไฟล์ .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //2. โหลด TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        // logging: true, // เปิดไว้ดู Log ตอนมันสร้าง Table ครับ
      }),
    }),
    UsersModule,
    TaskModule,
    LabelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
