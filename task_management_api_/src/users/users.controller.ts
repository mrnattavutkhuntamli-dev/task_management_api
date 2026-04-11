import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  destinationPath,
  editFileName,
  imageFileFilter,
} from 'src/common/utils/file-upload.utils';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enum/role.enum';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 ล็อคทั้ง Controller: ต้อง Login และต้องเช็ค Role
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post()
  @Roles(Role.ADMIN, Role.HR)
  @UseInterceptors(
    FileInterceptor('file', {
      // ชื่อ Field ใน Postman ต้องชื่อ 'file'
      storage: diskStorage({
        // ตั้งค่าไฟล์ที่จะใช้งานไว้ดูแล้ว
        destination: destinationPath('uploads/avatars'),
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 1024 * 1024 * 10 }, // จำกัดขนาดไฟล์ต่อหน่วย 10MB
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = await this.usersService.create(createUserDto, file);
    return {
      statusCode: 201,
      message: 'สร้างบัญชีผู้ใช้สำเร็จ',
      data: user,
    };
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, search });
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER, Role.HR)
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(id, req);
  }
  @Roles(Role.ADMIN, Role.HR, Role.USER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      // ชื่อ Field ใน Postman ต้องชื่อ 'file'
      storage: diskStorage({
        // ตั้งค่าไฟล์ที่จะใช้งานไว้ดูแล้ว
        destination: destinationPath('uploads/avatars'),
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 1024 * 1024 * 10 }, // จำกัดขนาดไฟล์ต่อหน่วย 10MB
    }),
  )
  async update(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = await this.usersService.update(req, id, updateUserDto, file);
    return {
      statusCode: 200,
      message: 'อัพเดทบัญชีผู้ใช้สำเร็จ',
      data: user,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
