/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

const request: any = (supertest as any).default || supertest;

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdTaskId: string; // ไว้เก็บ ID งานที่สร้างเพื่อเอาไปใช้ใน Test ถัดไป

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

    // 🚩 1. Login ก่อนเพื่อเอา Token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'mr.nattavut.khuntamli@gmail.com', // 🚩 ใช้ User ที่เป็น Admin/HR เพื่อทดสอบทุกเส้นได้
        password: 'Aa1231234',
      });

    accessToken =
      loginResponse.body.access_token || loginResponse.body.data?.access_token;
  });

  describe('Task Management Flow', () => {
    // ✅ สร้าง Task
    it('/task (POST) - ควรสร้างงานใหม่สำเร็จ', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/task')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'งานใหม่ของกอล์ฟ',
          description: 'รายละเอียดการทดสอบ E2E',
        });

      expect(response.status).toBe(201);
      createdTaskId = response.body.id || response.body.data?.id; // เก็บ ID ไว้
    });

    // ✅ ดึงรายการ Task ทั้งหมด
    it('/task (GET) - ควรดึงรายการงานทั้งหมดได้', () => {
      return request(app.getHttpServer())
        .get('/api/v1/task')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: any) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // ✅ อัปเดตสถานะ (เส้นนี้มี @Roles)
    it('/task/:id/status (PATCH) - ควรเปลี่ยนสถานะได้ (ถ้าเป็น Admin/HR)', async () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/task/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200);
    });

    // ✅ ทดสอบความปลอดภัย (ไม่ใส่ Token)
    it('/task (GET) - ถ้าไม่ใส่ Token ต้องติด 401', () => {
      return request(app.getHttpServer()).get('/api/v1/task').expect(401);
    });
  });

  describe('Comments & Attachments', () => {
    // ✅ เพิ่ม Comment
    it('/task/:id/comments (POST) - ควรเพิ่มคอมเมนต์ได้', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/task/${createdTaskId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'คอมเมนต์ทดสอบโดยกอล์ฟ',
        })
        .expect(201);
    });

    // ✅ ทดสอบ File Upload (ถ้ามีไฟล์ตัวอย่างในเครื่องกอล์ฟ)
    it('/task/:id/attachments (POST) - ควรแนบไฟล์ได้', async () => {
      // 🚩 กอล์ฟต้องมีไฟล์ชื่อ 'test.png' อยู่ในโฟลเดอร์ test หรือเปลี่ยน path ให้ถูก
      // ถ้าไม่มีไฟล์ให้ skip เทสนี้ไปก่อนครับ
      /*
      return request(app.getHttpServer())
        .post(`/api/v1/task/${createdTaskId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', 'test/test-image.png') 
        .expect(201);
      */
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
