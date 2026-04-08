/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

// กำหนด Type ให้ request เพื่อลดขีดแดง
const request: supertest.SuperTest<supertest.Test> =
  (supertest as any).default || supertest;

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Setup เหมือนใน main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  describe('/auth/login (POST)', () => {
    it('ควร Login สำเร็จและคืนค่า Access Token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          // 🚩 กอล์ฟเช็คให้ชัวร์ว่า Email นี้มีใน DB และ Password ถูกต้อง
          email: 'mr.nattavut.khuntamli@gmail.com',
          password: 'Aa1231234',
        });

      // ถ้าพัง กอล์ฟดู Log ตัวนี้ใน Console นะครับ
      if (response.status !== 200) {
        console.log('Login Failed Body:', response.body);
      }

      expect(response.status).toBe(200);

      // 🚩 เช็ค Property ตรงๆ (ถ้ากอล์ฟไม่ได้ครอบด้วย { data: ... })
      expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });

    it('ควร Login ไม่ผ่านหากรหัสผ่านผิด (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'mr.nattavut.khuntamli@gmail.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('ควรดึงข้อมูล Profile ได้เมื่อส่ง Token ที่ถูกต้อง', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 200) {
        console.log('Get Profile Failed Body:', response.body);
      }

      expect(response.status).toBe(200);
      // เช็คค่าที่กอล์ฟเห็นใน console.log รอบที่แล้ว
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('ควรถูกปฏิเสธ (401) หากไม่มี Token', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
