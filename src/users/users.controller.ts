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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
