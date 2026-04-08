/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

const request: any = (supertest as any).default || supertest;

describe('DashboardController (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    // 🚩 Login เพื่อเอา Token มาใช้
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'mr.nattavut.khuntamli@gmail.com',
        password: 'Aa1231234', // 👈 เช็ค Pass ให้ถูกนะครับ
      });

    accessToken = loginResponse.body.access_token;

    // 💡 ถ้า accessToken เป็น undefined เทสจะพังแน่ๆ ลอง Log ดูครับ
    // console.log('DEBUG Token:', accessToken);
  });

  it('/api/v1/dashboard/status (GET) - ต้องผ่าน', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/dashboard/status') // 🚩 เช็คสะกด u/a ให้ตรงกับ Controller
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/api/v1/dashboard/status (GET) - ถ้าไม่ใส่ Token ต้องติด 401', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/dashboard/status') // 🚩 ใช้ Path เดียวกับข้างบน
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
