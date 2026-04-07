import {
  Body,
  Controller,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Forgot_passwordDto } from './dto/forgot-password.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // แนะนำให้สร้าง LoginDto เพื่อความปลอดภัย
    return this.authService.login(loginDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('forgot-password')
  async forgotPassword(@Body() forgot_passwordDto: Forgot_passwordDto) {
    return this.authService.forgotPassword(forgot_passwordDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ตั้งค่ารหัสผ่านใหม่ด้วย Token จากอีเมล' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
