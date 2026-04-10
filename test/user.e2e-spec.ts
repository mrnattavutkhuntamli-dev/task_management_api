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
      expect(response.status).toBe(200);
      const users = response.body.items;
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('/users/:id (GET) - ควรดึงรายการผู้ใช้คนนั้น', async () => {
      createdUserId = 'bb2af3f9-41a5-4fcb-a5e1-fcc042ae94dd';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      const user = response.body;
      expect(typeof user).toBe('object');
      expect(user.id).toBe(createdUserId);
      expect(user.email).toBe('mr.nattavut.khuntamli@gmail.com');
      expect(user.role).toBe('admin');
      expect(user).toBeDefined();
      expect(user.password).toBeUndefined();
    });

    it('/users/:id (Patch) - อัพเดทข้อมูลผู้ใช้ใหม่สำเร็จ', async () => {
      createdUserId = '64ec767d-392c-45bd-b779-428bb05ecb61';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: 'password123',
        });
      expect(response.status).toBe(200);
    });

    it('/users/:id (Delete) - ลบข้อมูลผู้ใช้ใหม่สำเร็จ', async () => {
      createdUserId = '2bd6f866-f9dd-4409-af90-15baf5af68a5';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
