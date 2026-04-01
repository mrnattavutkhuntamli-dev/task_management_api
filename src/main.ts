import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  // Perfix สำหรับ API ที่ใช้งานกับ NestJS
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
