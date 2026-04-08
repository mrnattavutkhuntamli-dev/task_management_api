import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

// สูตรแก้ TypeError สำหรับสภาพแวดล้อม Windows
const request = (supertest as any).default || supertest;

describe('DashboardController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 🚩 Setup ให้เหมือน main.ts เป๊ะๆ
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalInterceptors(new TransformInterceptor());

    // 🚩 กำหนด Prefix ก่อน init
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  it('/api/v1/dashboard/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/dashboard/status')
      .expect(200)
      .expect((res) => {
        // ตรวจสอบโครงสร้างข้อมูลเบื้องต้น
        expect(res.body).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
