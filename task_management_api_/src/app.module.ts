import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';
import { LabelModule } from './label/label.module';
import { AuthModule } from './auth/auth.module';
import { StatusTaskModule } from './status_task/status_task.module';
import { PriorityTaskModule } from './priority_task/priority_task.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import { DashboardModule } from './dashboard/dashboard.module';
import { ActivitiesModule } from './activities/activities.module';
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
    // โหลดตั้งค่า Mailer สำหรับ Resend
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: config.get<boolean>('MAIL_SECURE'),
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('RESEND_API_KEY'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_FROM'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 นาที
        limit: 10, // ยิงได้ไม่เกิน 10 ครั้งต่อนาที
      },
    ]),
    AuthModule,
    DashboardModule,
    UsersModule,
    TaskModule,
    LabelModule,
    StatusTaskModule,
    PriorityTaskModule,
    ActivitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
