import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enum/role.enum';
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { limit: 10, ttl: 6000 } }) // ไม่ให้ยิงบ่อย
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('status')
  @Roles(Role.ADMIN, Role.USER)
  async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
