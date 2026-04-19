import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './material.dto';
import { PaginationDto } from '../common/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active materials (public)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() pagination: PaginationDto) {
    return this.materialsService.findAll(pagination, true);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all materials including inactive (admin)' })
  findAllAdmin(@Query() pagination: PaginationDto) {
    return this.materialsService.findAll(pagination, false);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get material by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.materialsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create material (admin)' })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update material (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete material (admin)' })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }

}
