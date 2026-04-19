import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResult,
  paginate,
} from '../common/pagination.dto';
import { CreateQuoteDto } from './quote.dto';
import { PricingService } from './pricing.service';
import { Quote } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async create(dto: CreateQuoteDto): Promise<Quote> {
    const breakdown = await this.pricingService.calculatePrice(
      dto.configuration,
    );

    return this.prisma.quote.create({
      data: {
        configurationSnapshot: dto.configuration as object,
        totalPrice: breakdown.totalPrice,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        clientEmail: dto.clientEmail,
        clientComment: dto.clientComment,
      },
    });
  }

  async findAll(
    pagination: PaginationDto,
    status?: QuoteStatus,
  ): Promise<PaginatedResult<Quote>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findById(id: string): Promise<Quote> {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async updateStatus(
    id: string,
    status: QuoteStatus,
    adminNotes?: string,
  ): Promise<Quote> {
    await this.findById(id);
    return this.prisma.quote.update({
      where: { id },
      data: { status, adminNotes },
    });
  }
}
