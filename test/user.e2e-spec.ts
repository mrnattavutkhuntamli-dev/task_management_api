/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

const request: any = (supertest as any).default || supertest;

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: string;

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

    // 🚩 Login ด้วย Admin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'mr.nattavut.khuntamli@gmail.com',
        password: 'Aa1231234',
      });

    accessToken =
      loginResponse.body.access_token || loginResponse.body.data?.access_token;
  });

  describe('Users Management Flow', () => {
    it('/users (POST) - สร้างข้อมูลผู้ใช้ใหม่สำเร็จ', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User',
          email: `test-${Date.now()}@gmail.com`, // 🚩 ใส่ timestamp กัน email ซ้ำใน DB
          password: 'password123',
          role: 'user',
        });

      expect(response.status).toBe(201);
      // เก็บ ID ไว้เผื่อใช้ Test Delete หรือ Update
      createdUserId = response.body.id || response.body.data?.id;
    });

    // 🚩 จุดที่เคยพัง: แก้ไขให้เช็ค Array ได้ถูกต้อง
    it('/users (GET) - ควรดึงรายการผู้ใช้ทั้งหมดได้', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`);

      // console.log(
      //     'ACTUAL RESPONSE BODY:',
      //     JSON.stringify(response.body, null, 2),
      // );
      expect(response.status).toBe(200);
      const users = response.body.items;
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
