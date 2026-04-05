import { BadRequestException } from '@nestjs/common';
import { extname, join } from 'path';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Request, Express } from 'express';

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

/**
 * Helper function สำหรับลบไฟล์ออกจาก Disk
 */
export const removeFile = (filename: string) => {
  const filePath = join(process.cwd(), 'uploads/avatars', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const allFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
    return callback(
      new BadRequestException(
        'รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png , pdf) เท่านั้น!',
      ),
      false,
    );
  }
  callback(null, true);
};

export const deletePhysicalFiles = (
  filesOrPaths: (Express.Multer.File | string)[],
) => {
  filesOrPaths.forEach((item) => {
    // 💡 เช็คว่าถ้าเป็น string ให้ใช้ค่านั้นเลย ถ้าเป็น object ให้ดึง .path ออกมา
    const filePath = typeof item === 'string' ? item : item.path;

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      // พ่น log ไว้ดูเฉยๆ ไม่ให้กระทบ flow หลัก
      console.error(`Failed to delete file at ${filePath}:`, err);
    }
  });
};
