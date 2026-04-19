import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHardwarePricingDto } from './hardware-pricing.dto';

@Injectable()
export class HardwarePricingService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hardwarePricing.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const item = await this.prisma.hardwarePricing.findUnique({ where: { key } });
    if (!item) throw new NotFoundException(`Pricing key "${key}" not found`);
    return item;
  }

  async update(id: string, dto: UpdateHardwarePricingDto) {
    const item = await this.prisma.hardwarePricing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Pricing item not found');

    return this.prisma.hardwarePricing.update({
      where: { id },
      data: {
        ...(dto.priceFixed !== undefined && { priceFixed: dto.priceFixed }),
        ...(dto.pricePerM !== undefined && { pricePerM: dto.pricePerM }),
        ...(dto.labelI18n !== undefined && { labelI18n: dto.labelI18n }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
