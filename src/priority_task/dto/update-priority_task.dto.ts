import { PartialType } from '@nestjs/swagger';
import { CreatePriorityTaskDto } from './create-priority_task.dto';

export class UpdatePriorityTaskDto extends PartialType(CreatePriorityTaskDto) {}
