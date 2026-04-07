import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PriorityTaskService } from './priority_task.service';
import { CreatePriorityTaskDto } from './dto/create-priority_task.dto';
import { UpdatePriorityTaskDto } from './dto/update-priority_task.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('priority-task')
export class PriorityTaskController {
  constructor(private readonly priorityTaskService: PriorityTaskService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างระดับความสำคัญใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างสำเร็จ' })
  create(@Body() createPriorityTaskDto: CreatePriorityTaskDto) {
    return this.priorityTaskService.create(createPriorityTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดึงข้อมูลระดับความสำคัญทั้งหมด (เรียงตาม Level)' })
  findAll() {
    return this.priorityTaskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลระดับความสำคัญตาม ID' })
  findOne(@Param('id') id: string) {
    return this.priorityTaskService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลระดับความสำคัญ' })
  update(
    @Param('id') id: string,
    @Body() updatePriorityTaskDto: UpdatePriorityTaskDto,
  ) {
    return this.priorityTaskService.update(+id, updatePriorityTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบระดับความสำคัญ (Hybrid: Soft/Hard Delete)' })
  remove(@Param('id') id: string) {
    return this.priorityTaskService.remove(+id);
  }
}
