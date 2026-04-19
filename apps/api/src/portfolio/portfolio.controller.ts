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
  ApiTags,
} from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
} from './portfolio.dto';
import { PaginationDto } from '../common/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get published portfolio items (public)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.portfolioService.findAll(pagination, true);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all portfolio items (admin)' })
  findAllAdmin(@Query() pagination: PaginationDto) {
    return this.portfolioService.findAll(pagination, false);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get portfolio item by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.portfolioService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create portfolio item (admin)' })
  create(@Body() dto: CreatePortfolioItemDto) {
    return this.portfolioService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update portfolio item (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdatePortfolioItemDto) {
    return this.portfolioService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete portfolio item (admin)' })
  remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }

}
