import {
  Body,
  Controller,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'; // นำเข้า Swagger Decorators
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Forgot_passwordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    refreshToken?: string;
  };
}
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'เข้าสู่ระบบ (Login)' })
  @ApiResponse({ status: 200, description: 'Login สำเร็จ และส่งคืน Tokens' })
  @ApiResponse({ status: 401, description: 'Email หรือ Password ไม่ถูกต้อง' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // แนะนำให้สร้าง LoginDto เพื่อความปลอดภัย
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'ขอ Reset Password ผ่าน Email' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('forgot-password')
  async forgotPassword(@Body() forgot_passwordDto: Forgot_passwordDto) {
    return this.authService.forgotPassword(forgot_passwordDto);
  }

  @ApiOperation({ summary: 'ตั้งค่ารหัสผ่านใหม่ด้วย Token' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // เช่น ยอมให้ลองผิดลองถูกได้แค่ 5 ครั้งต่อนาที
  @UseGuards(ThrottlerGuard) // ป้องกันการยิง Request ซ้ำๆ ถล่มเข้ามาในระบบ (Brute Force/Spam) เกินจำนวนที่เรากำหนดไว้ใน AppModule
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ตั้งค่ารหัสผ่านใหม่ด้วย Token จากอีเมล' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiBearerAuth() // บอก Swagger ว่าเส้นนี้ต้องใส่ Bearer Token (Access Token)
  @ApiOperation({ summary: 'เปลี่ยนรหัสผ่าน (ขณะ Login อยู่)' })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: RequestWithUser,
    @Ip() ip: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, ip, changePasswordDto);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูข้อมูล Profile ของตัวเอง' })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
  @ApiBearerAuth() // สำหรับ Refresh ให้ใส่ Refresh Token ในช่อง Authorize
  @ApiOperation({ summary: 'ขอ Access Token ใหม่ด้วย Refresh Token' })
  @ApiResponse({ status: 200, description: 'สร้าง Tokens ชุดใหม่สำเร็จ' })
  @Post('refresh')
  @UseGuards(RefreshTokenGuard) // สร้าง Guard แยกสำหรับเช็ค Refresh Token
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: RequestWithUser) {
    return this.authService.refreshTokens(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'ออกจากระบบ (Logout)' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: RequestWithUser) {
    await this.authService.logout(req);
    return { message: 'Logged out successfully' };
  }
}
