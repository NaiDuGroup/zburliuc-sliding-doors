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
import { CreateMaterialDto, UpdateMaterialDto } from './material.dto';
import { Material } from '@prisma/client';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    onlyActive = false,
  ): Promise<PaginatedResult<Material>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = onlyActive ? { isActive: true } : {};

    const [data, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.material.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findBySlug(slug: string): Promise<Material> {
    const material = await this.prisma.material.findUnique({ where: { slug } });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async findById(id: string): Promise<Material> {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async create(dto: CreateMaterialDto): Promise<Material> {
    const existing = await this.prisma.material.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already exists');

    return this.prisma.material.create({
      data: {
        ...dto,
        pricePerM2: dto.pricePerM2,
        nameI18n: dto.nameI18n,
        descI18n: dto.descI18n ?? {},
        colorOptions: dto.colorOptions ?? [],
      },
    });
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    await this.findById(id);
    return this.prisma.material.update({
      where: { id },
      data: {
        ...dto,
        nameI18n: dto.nameI18n as Record<string, string> | undefined,
        descI18n: dto.descI18n as Record<string, string> | undefined,
        colorOptions: dto.colorOptions,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.material.delete({ where: { id } });
  }
}
