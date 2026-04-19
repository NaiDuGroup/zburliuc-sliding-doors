import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QuoteStatus } from '@prisma/client';
import { QuotesService } from './quotes.service';
import { PricingService } from './pricing.service';
import {
  CreateQuoteDto,
  PriceCalculationDto,
} from './quote.dto';
import { PaginationDto } from '../common/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly pricingService: PricingService,
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate door price (public)' })
  calculatePrice(@Body() dto: PriceCalculationDto) {
    return this.pricingService.calculatePrice(dto.configuration);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a quote request (public)' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all quotes (admin)' })
  @ApiQuery({ name: 'status', enum: QuoteStatus, required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: QuoteStatus,
  ) {
    return this.quotesService.findAll(pagination, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quote by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update quote status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: QuoteStatus,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.quotesService.updateStatus(id, status, adminNotes);
  }
}
