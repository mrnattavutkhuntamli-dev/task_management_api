/**
 *  ไฟล์ auth ประกอบไปด้วย
 *  modules auth ทั้งหมดสำหรับการตรวจสอบที่มีสิทธิ์ใน Role ที่อนุญาติให้เข้าถึงเส้นของ api
 *  common/decorators/roles.decorators.ts ที่สร้างคำสั่งให้ตรวจสอบว่ามีสิทธิ์ใน Role ที่อนุญาติให้เข้าถึงเส้นของ api
 *  common/enum/role.enum.ts ที่สร้างคำสั่งให้ตรวจสอบว่ามีสิทธิ์ใน Role ที่อนุญาติให้เข้าถึงเส้นของ api
 */

import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ActivitiesModule,
    UsersModule,
    MailerModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        // 💡 มีปีกกา ต้องมี return
        return {
          secret: config.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: (config.get('JWT_EXPIRES_IN') ?? '1d') as StringValue,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
