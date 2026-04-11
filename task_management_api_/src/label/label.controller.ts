import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
@Controller('label')
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(
    @Body() createLabelDto: CreateLabelDto,
    @Request() req: RequestWithUser,
  ) {
    return this.labelService.create(createLabelDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.labelService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labelService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
  ) {
    return this.labelService.update(req.user.userId, id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.labelService.remove(req.user.userId, id);
  }
}
