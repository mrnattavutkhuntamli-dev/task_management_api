import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Req() req: RequestWithUser) {
    const id: string = req.user.userId;
    return this.usersService.findByID(id);
  }

  @Patch()
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req, updateUserDto, file);
  }
}
