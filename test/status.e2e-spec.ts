/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

const request: any = (supertest as any).default || supertest;

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let statusID: number;

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

  describe('Status Management Flow', () => {
    // it('/status-task (POST) - สร้างข้อมูลผู้ใช้ใหม่สำเร็จ', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/api/v1/status-task')
    //     .set('Authorization', `Bearer ${accessToken}`)
    //     .send({
    //       key: 'Test User',
    //       label: `test-${Date.now()}@gmail.com`, // 🚩 ใส่ timestamp กัน email ซ้ำใน DB
    //       color: '#3b82f6',
    //     });

    //   expect(response.status).toBe(201);
    //   // เก็บ ID ไว้เผื่อใช้ Test Delete หรือ Update
    //   createdUserId = response.body.id || response.body.data?.id;
    // });

    // 🚩 จุดที่เคยพัง: แก้ไขให้เช็ค Array ได้ถูกต้อง
    it('/status-task (GET) - ควรดึงรายการผู้ใช้ทั้งหมดได้', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/status-task')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      const statusTask = response.body;
      expect(Array.isArray(statusTask)).toBe(true);
      expect(statusTask.length).toBeGreaterThan(0);
    });

    it('/status-task/:id (GET) - ดีงข้อมูลสถานะ', async () => {
      statusID = 7;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/status-task/${statusID}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      const statusTask = response.body;
      expect(statusTask).toBeDefined();
      expect(statusTask.id).toBe(statusID);
      // สมมติว่า Status มี field ชื่อ 'name' เช่น 'Pending', 'In Progress'
      expect(statusTask).toHaveProperty('key');
    });

    it('/status-task/:id (Patch) - อัพเดทข้อมูลสถานะสำเร็จ', async () => {
      statusID = 7;
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/status-task/${statusID}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ket: 'password123',
        });
      expect(response.status).toBe(200);
    });

    it('/status-task/:id (Delete) - ลบข้อมูลสถานะสำเร็จ', async () => {
      statusID = 7;
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/status-task/${statusID}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
