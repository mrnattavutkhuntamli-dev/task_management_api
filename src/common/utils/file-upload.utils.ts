import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Request } from 'express';

// 1. Logic สำหรับการกรองเฉพาะรูปภาพ
export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(
      new BadRequestException(
        'รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png) เท่านั้น!',
      ),
      false,
    );
  }
  callback(null, true);
};

// 2. Logic สำหรับการตั้งชื่อไฟล์ใหม่ (ใช้ UUID)
export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileExtName = extname(file.originalname);

  // ใช้ randomUUID เพื่อชื่อไฟล์ที่ได้มาตรฐานสากลและไม่ซ้ำแน่นอน
  const fileName = randomUUID();

  callback(null, `${fileName}${fileExtName}`);
};

// 3. Logic สำหรับเช็คและสร้างโฟลเดอร์อัตโนมัติ
export const destinationPath = (path: string) => {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
    callback(null, path);
  };
};
