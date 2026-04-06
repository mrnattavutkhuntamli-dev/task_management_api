import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StatusTaskService } from './status_task.service';
import { CreateStatusTaskDto } from './dto/create-status_task.dto';
import { UpdateStatusTaskDto } from './dto/update-status_task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enum/role.enum';
@Controller('status-task')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 ล็อคทั้ง Controller: ต้อง Login และต้องเช็ค Role
export class StatusTaskController {
  constructor(private readonly statusTaskService: StatusTaskService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createStatusTaskDto: CreateStatusTaskDto) {
    return this.statusTaskService.create(createStatusTaskDto);
  }

  @Get()
  findAll() {
    return this.statusTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.statusTaskService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR)
  update(
    @Param('id') id: number,
    @Body() updateStatusTaskDto: UpdateStatusTaskDto,
  ) {
    return this.statusTaskService.update(+id, updateStatusTaskDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR)
  remove(@Param('id') id: number) {
    return this.statusTaskService.remove(+id);
  }
}
