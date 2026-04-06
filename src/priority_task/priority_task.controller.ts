import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PriorityTaskService } from './priority_task.service';
import { CreatePriorityTaskDto } from './dto/create-priority_task.dto';
import { UpdatePriorityTaskDto } from './dto/update-priority_task.dto';

@Controller('priority-task')
export class PriorityTaskController {
  constructor(private readonly priorityTaskService: PriorityTaskService) {}

  @Post()
  create(@Body() createPriorityTaskDto: CreatePriorityTaskDto) {
    return this.priorityTaskService.create(createPriorityTaskDto);
  }

  @Get()
  findAll() {
    return this.priorityTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priorityTaskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePriorityTaskDto: UpdatePriorityTaskDto) {
    return this.priorityTaskService.update(+id, updatePriorityTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priorityTaskService.remove(+id);
  }
}
