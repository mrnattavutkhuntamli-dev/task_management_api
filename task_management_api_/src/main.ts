import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // เปิด cors สำหรับ API ที่ใช้งานกับ NestJS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  // เปิดใช้งาน Validation ทั่วทั้ง App
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // 2. ใช้ ClassSerializerInterceptor (เพื่อจัดการ @Exclude() ซ่อน Password)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // 3. 💡 เพิ่มตรงนี้: ใช้ TransformInterceptor เพื่อจัด Format Response ให้สวยงาม
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Nak Drive: Task Management API') // ชื่อโปรเจกต์จริง
    .setDescription(
      'ระบบจัดการงานหลังบ้านสำหรับ Nak Drive รองรับการจัดการ Task, Labels และระบบยืนยันตัวตน',
    )
    .setVersion('1.0')
    .addBearerAuth() // 👈 สำคัญ! เพื่อให้ Swagger มีปุ่มใส่ Token ไว้ทดสอบเส้นที่ต้อง Login
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  // Perfix สำหรับ API ที่ใช้งานกับ NestJS
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
