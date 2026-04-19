import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResult,
  paginate,
} from '../common/pagination.dto';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
} from './portfolio.dto';
import { PortfolioItem } from '@prisma/client';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    onlyPublished = false,
  ): Promise<PaginatedResult<PortfolioItem>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = onlyPublished ? { isPublished: true } : {};

    const [data, total] = await Promise.all([
      this.prisma.portfolioItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.portfolioItem.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findBySlug(slug: string): Promise<PortfolioItem> {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { slug },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async findById(id: string): Promise<PortfolioItem> {
    const item = await this.prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async create(dto: CreatePortfolioItemDto): Promise<PortfolioItem> {
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already exists');

    return this.prisma.portfolioItem.create({
      data: {
        ...dto,
        titleI18n: dto.titleI18n,
        descI18n: dto.descI18n ?? {},
        tags: dto.tags ?? [],
        imageUrls: dto.imageUrls,
      },
    });
  }

  async update(
    id: string,
    dto: UpdatePortfolioItemDto,
  ): Promise<PortfolioItem> {
    await this.findById(id);
    return this.prisma.portfolioItem.update({
      where: { id },
      data: {
        ...dto,
        titleI18n: dto.titleI18n as Record<string, string> | undefined,
        descI18n: dto.descI18n as Record<string, string> | undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.portfolioItem.delete({ where: { id } });
  }
}
