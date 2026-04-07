import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { paginate } from 'src/common/utils/pagination.utils';
import { removeFile } from 'src/common/utils/file-upload.utils';
import { Role } from 'src/common/enum/role.enum';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    // 1. ตรวจสอบ email นี้ว่ามีอยู่ใน ตาราง ของ users แล้วหรือยัง
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // 💡 ถ้าเจอ Email ซ้ำตรงนี้ และมีไฟล์อัปโหลดมาแล้ว ให้ลบทิ้งทันที
      if (file) await unlink(file.path);
      throw new ConflictException('อีเมลนี้มีอยู่แล้ว');
    }
    // 2. สร้าง instance ของ user จาก DTO
    const user = this.userRepository.create(createUserDto);

    // 3. 💡 เพิ่มตรงนี้: ถ้ามีไฟล์ส่งมา ให้เอาชื่อไฟล์ไปเก็บใน field avatar
    if (file) {
      // เก็บ path ที่เราตั้งไว้ใน Static Module (เช่น /avatars/filename.jpg)
      user.avatar = `/avatars/${file.filename}`;
    }
    try {
      // 4. บันทึกข้อมูลลงตาราง users
      return await this.userRepository.save(user);
    } catch (error) {
      if (file) await unlink(file.path);
      throw error;
    }
  }

  findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page, limit, search } = query; // รับค่าจาก Query ประกอบไปด้วย page limit search
    const queryBuilder = this.userRepository.createQueryBuilder('user'); // สร้าง Query Builder จาก Entity ของ User
    /**
     *  ถ้า query ของ search มีค่าให้ทำการเข้าเงือนไข queryBuilder โดยสร้างคำสั่งที่ต้องการด้วย ILIKE
     *  เช่น user.name ILIKE :search หรือ user.email ILIKE :search
     */
    if (search) {
      // ใช้ ILIKE สำหรับการค้นหาแบบไม่สนใจตัวพิมพ์เล็ก-ใหญ่ (PostgreSQL)
      queryBuilder.where(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    // กำหนดการแบ่งหน้าโดยจัดการตัวเลขและจัดหมวดหมู่ข้อมูลในรอบที่สุด
    queryBuilder.orderBy('user.createdAt', 'DESC');
    // ดึงข้อมูลรายการและจำนวนทั้งหมดพร้อมกัน (จำนวนทั้งหมดต่อหน้า)
    return paginate(queryBuilder, { page, limit });
  }

  async findOne(id: string, req: RequestWithUser) {
    const targetUser = await this.userRepository.findOne({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`ไม่พบผู้ใช้ที่ระบุอีเมลนี้ ${id}`);
    }
    const isPrivilegedRole = [Role.ADMIN, Role.HR].includes(
      req.user.role as Role,
    );
    const isOwner = req.user.userId === targetUser.id;
    // 🛡️ ถ้า "ไม่ใช่ ADMIN/HR" และ "ไม่ใช่เจ้าของข้อมูล" -> สั่ง Forbidden ทันที
    if (!isPrivilegedRole && !isOwner) {
      throw new ForbiddenException(
        'คุณไม่มีสิทธิ์เข้าถึงข้อมูลของผู้ใช้งานรายอื่น',
      );
    }
    return targetUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // 💡 บังคับให้ดึง password ออกมาด้วย แม้จะโดน Exclude ไว้
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * อัปเดตข้อมูลผู้ใช้ พร้อมจัดการไฟล์รูปภาพเก่า
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    // 1. ค้นหา User เดิมก่อน (ถ้าไม่เจอให้พ่น 404)
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      // ถ้ามีรูปใหม่ส่งมาแต่หา User ไม่เจอ ต้องลบรูปใหม่ทิ้งทันที่
      if (file) removeFile(file.filename);
      throw new NotFoundException(`ไม่พบผู้ใช้ที่ระบุอีเมลนี้ ${id}`);
    }

    const oldAvatar = user.avatar; // เก็บ path รูปเก่าไว้ก่อน
    try {
      // 2. ถ้ามีการอัปโหลดรูปใหม่ ให้เตรียม path ใหม่
      if (file) {
        user.avatar = `/avatars/${file.filename}`;
      }
      // 3. Merge ข้อมูลจาก DTO เข้าไปใน Entity
      Object.assign(user, updateUserDto);
      // 4. บันทึกลง Database
      const updatedUser = await this.userRepository.save(user);

      // 5. 💡 หัวใจสำคัญ: ถ้าบันทึกสำเร็จ และมีรูปใหม่มา ให้ลบรูปเก่าทิ้ง (ถ้ามี)
      if (file && oldAvatar) {
        removeFile(oldAvatar.replace('/avatars/', ''));
      }
      return updatedUser;
    } catch (error) {
      // ถ้าเกิด Error ระหว่าง save เช่น email ช้ำ หรือ อื่นๆ จะต้องลบรูปใหม่ที่เพิ่งอัปโหลดมาทิ้ง
      if (file) removeFile(file.filename);
      throw new InternalServerErrorException(
        'เกิดข้อผิดพลาดในการอัปเดตข้อมูล ' + error,
      );
    }
  }

  async remove(id: string) {
    // 1. ค้นหาข้อมูล User พร้อมข้อมูล avatar ก่อนลบ
    const user = await this.userRepository.findOne({ where: { id } });
    // 2. ถ้าไม่เจอ User ให้พ่น Error 404
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้รหัส: ${id}`);
    }
    // 3. เก็บชื่อไฟล์รูปภาพไว้ (ถ้ามี)
    const avatarPath = user.avatar;
    // 4. ลบข้อมูลออกจาก Database
    await this.userRepository.remove(user);
    // 5. 💡 หัวใจสำคัญ: ถ้าลบจาก DB สำเร็จ ให้ตามไปลบไฟล์รูปในโฟลเดอร์ด้วย
    if (avatarPath) {
      // อย่าลืม import { removeFile } จาก utils นะครับ
      removeFile(avatarPath);
    }
    return { message: 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว' };
  }
}
