import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DoorConfigurationDto,
  PriceBreakdownDto,
  SectionConfigDto,
} from './quote.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Fallback constants if DB rows are not yet seeded
const DEFAULT_HARDWARE_PRICE_PER_PANEL = 85;
const DEFAULT_FRAME_PRICE_PER_METER = 12;

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePrice(
    config: DoorConfigurationDto,
  ): Promise<PriceBreakdownDto> {
    const panelWidthM =
      (config.openingWidth / config.panels.length) / 1000;
    const panelHeightM = config.openingHeight / 1000;

    const allMaterialIds = config.panels.flatMap((p) =>
      p.sections.map((s: SectionConfigDto) => s.materialId),
    );
    const uniqueIds = [...new Set(allMaterialIds)];

    const materials = await this.prisma.material.findMany({
      where: { id: { in: uniqueIds }, isActive: true },
    });

    if (materials.length !== uniqueIds.length) {
      throw new BadRequestException(
        'One or more selected materials are unavailable',
      );
    }

    // Load pricing config from DB (with fallback to constants)
    const [hwRow, frameRow] = await Promise.all([
      this.prisma.hardwarePricing.findUnique({ where: { key: 'hardware_per_panel' } }),
      this.prisma.hardwarePricing.findUnique({ where: { key: 'frame_per_meter' } }),
    ]);

    const hardwarePricePerPanel = hwRow?.priceFixed
      ? Number(hwRow.priceFixed)
      : DEFAULT_HARDWARE_PRICE_PER_PANEL;

    const framePricePerMeter = frameRow?.pricePerM
      ? Number(frameRow.pricePerM)
      : DEFAULT_FRAME_PRICE_PER_METER;

    const priceMap = new Map<string, Decimal>(
      materials.map((m) => [m.id, m.pricePerM2]),
    );

    let materialsPrice = 0;

    for (const panel of config.panels) {
      for (const section of panel.sections) {
        const sectionHeightM = panelHeightM * section.heightRatio;
        const areaSqM = panelWidthM * sectionHeightM;
        const pricePerM2 = Number(priceMap.get(section.materialId) ?? 0);
        materialsPrice += areaSqM * pricePerM2;
      }
    }

    const hardwarePrice = config.panels.length * hardwarePricePerPanel;

    const perimeterM =
      2 * ((config.openingWidth + config.openingHeight) / 1000);
    const framePrice = perimeterM * framePricePerMeter;

    const totalPrice = materialsPrice + hardwarePrice + framePrice;

    return {
      totalPrice: Math.round(totalPrice * 100) / 100,
      materialsPrice: Math.round(materialsPrice * 100) / 100,
      hardwarePrice: Math.round(hardwarePrice * 100) / 100,
      framePrice: Math.round(framePrice * 100) / 100,
      currency: 'EUR',
    };
  }
}
