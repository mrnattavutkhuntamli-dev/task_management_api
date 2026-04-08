import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config'; // 👈 เพิ่มเข้ามา
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

const request = (supertest as any).default || supertest;

describe('Dashboard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // 🚩 บังคับโหลด Config อีกครั้งเพื่อให้แน่ใจว่าค่า DB มาครบ
        ConfigModule.forRoot({ isGlobal: true }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Setup เหมือน main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalInterceptors(new TransformInterceptor());

    // 🚩 สำคัญ: ใส่ Prefix
    app.setGlobalPrefix('api/v1');

    await app.init();

    // 💡 ปล่อยให้มันรอสักนิด (Optional) เพื่อให้ DB Connection นิ่ง
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('/api/v1/dashboard/status (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/dashboard/status',
    );

    // 🚩 ถ้ายัง 404 ให้พ่น Body ออกมาดูว่ามันคืออะไรกันแน่
    if (response.status === 404) {
      console.log('DEBUG 404 Body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
