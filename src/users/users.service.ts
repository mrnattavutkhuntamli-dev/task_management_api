import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { ConflictException } from '@nestjs/common';
import { paginate } from 'src/common/utils/pagination.utils';
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
    const { page, limit, search } = query;
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    if (search) {
      // ใช้ ILIKE สำหรับการค้นหาแบบไม่สนใจตัวพิมพ์เล็ก-ใหญ่ (PostgreSQL)
      queryBuilder.where(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    queryBuilder.orderBy('user.createdAt', 'DESC');
    return paginate(queryBuilder, { page, limit });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
