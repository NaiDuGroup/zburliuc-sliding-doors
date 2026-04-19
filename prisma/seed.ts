import { PrismaClient, MaterialType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const adminEmail = process.env['ADMIN_EMAIL'] ?? 'admin@zburliuc.com';
  const adminPassword = process.env['ADMIN_PASSWORD'] ?? 'admin123';
  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        name: 'Administrator',
      },
    });
    console.log('✓ Admin created');
  }

  // Materials
  const materials: Array<{
    slug: string;
    nameI18n: Record<string, string>;
    descI18n: Record<string, string>;
    type: MaterialType;
    pricePerM2: number;
    colorOptions: Array<{ value: string; labelI18n: Record<string, string>; hexColor: string }>;
  }> = [
    {
      slug: 'clear-glass',
      nameI18n: { ru: 'Прозрачное стекло', en: 'Clear Glass', de: 'Klarglas' },
      descI18n: { ru: 'Закалённое прозрачное стекло 4мм', en: 'Tempered clear glass 4mm' },
      type: 'GLASS',
      pricePerM2: 45,
      colorOptions: [],
    },
    {
      slug: 'frosted-glass',
      nameI18n: { ru: 'Матовое стекло', en: 'Frosted Glass', de: 'Mattglas' },
      descI18n: { ru: 'Матовое закалённое стекло', en: 'Frosted tempered glass' },
      type: 'GLASS',
      pricePerM2: 55,
      colorOptions: [],
    },
    {
      slug: 'mirror',
      nameI18n: { ru: 'Зеркало', en: 'Mirror', de: 'Spiegel' },
      descI18n: { ru: 'Серебряное зеркало 4мм', en: 'Silver mirror 4mm' },
      type: 'MIRROR',
      pricePerM2: 65,
      colorOptions: [
        { value: 'silver', labelI18n: { ru: 'Серебро', en: 'Silver' }, hexColor: '#c0c0c0' },
        { value: 'bronze', labelI18n: { ru: 'Бронза', en: 'Bronze' }, hexColor: '#a07840' },
      ],
    },
    {
      slug: 'lacobel-black',
      nameI18n: { ru: 'Лакобель чёрный', en: 'Lacobel Black', de: 'Lacobel Schwarz' },
      descI18n: { ru: 'Лакобель — окрашенное стекло', en: 'Lacobel — lacquered glass' },
      type: 'LACOBEL',
      pricePerM2: 72,
      colorOptions: [
        { value: 'black', labelI18n: { ru: 'Чёрный', en: 'Black' }, hexColor: '#1a1a1a' },
        { value: 'white', labelI18n: { ru: 'Белый', en: 'White' }, hexColor: '#f5f5f5' },
        { value: 'graphite', labelI18n: { ru: 'Графит', en: 'Graphite' }, hexColor: '#4a4a4a' },
      ],
    },
    {
      slug: 'oak-wood',
      nameI18n: { ru: 'Дуб натуральный', en: 'Natural Oak', de: 'Natureiche' },
      descI18n: { ru: 'МДФ со шпоном дуба', en: 'MDF with oak veneer' },
      type: 'WOOD',
      pricePerM2: 89,
      colorOptions: [
        { value: 'light', labelI18n: { ru: 'Светлый', en: 'Light' }, hexColor: '#c8a97a' },
        { value: 'dark', labelI18n: { ru: 'Тёмный', en: 'Dark' }, hexColor: '#6b3f1e' },
        { value: 'natural', labelI18n: { ru: 'Натуральный', en: 'Natural' }, hexColor: '#9a6b3c' },
      ],
    },
    {
      slug: 'aluminum-profile',
      nameI18n: { ru: 'Алюминий', en: 'Aluminum', de: 'Aluminium' },
      descI18n: { ru: 'Алюминиевая панель', en: 'Aluminum panel' },
      type: 'ALUMINUM',
      pricePerM2: 98,
      colorOptions: [
        { value: 'silver', labelI18n: { ru: 'Серебро', en: 'Silver' }, hexColor: '#c0c0c0' },
        { value: 'black', labelI18n: { ru: 'Чёрный', en: 'Black' }, hexColor: '#2d2d2d' },
        { value: 'gold', labelI18n: { ru: 'Золото', en: 'Gold' }, hexColor: '#c9a96e' },
      ],
    },
  ];

  for (const mat of materials) {
    const exists = await prisma.material.findUnique({ where: { slug: mat.slug } });
    if (!exists) {
      await prisma.material.create({
        data: {
          slug: mat.slug,
          nameI18n: mat.nameI18n,
          descI18n: mat.descI18n,
          type: mat.type,
          pricePerM2: mat.pricePerM2,
          colorOptions: mat.colorOptions,
          isActive: true,
        },
      });
      console.log(`✓ Material: ${mat.slug}`);
    }
  }

  // Hardware pricing
  const hardwareItems = [
    {
      key: 'hardware_per_panel',
      labelI18n: {
        ru: 'Фурнитура и направляющие (за полотно)',
        en: 'Hardware & Rails (per panel)',
        de: 'Beschläge & Schienen (pro Flügel)',
      },
      priceFixed: 85,
      pricePerM: null,
      isActive: true,
    },
    {
      key: 'frame_per_meter',
      labelI18n: {
        ru: 'Рамка (за погонный метр периметра проёма)',
        en: 'Frame profile (per linear meter of perimeter)',
        de: 'Rahmenprofil (pro laufenden Meter Umfang)',
      },
      priceFixed: null,
      pricePerM: 12,
      isActive: true,
    },
  ];

  for (const item of hardwareItems) {
    await prisma.hardwarePricing.upsert({
      where: { key: item.key },
      create: item,
      update: {},
    });
    console.log(`✓ Hardware pricing: ${item.key}`);
  }

  // Portfolio items
  const portfolioItems = [
    {
      slug: 'modern-glass-wardrobe',
      titleI18n: { ru: 'Современный шкаф со стеклом', en: 'Modern Glass Wardrobe', de: 'Moderner Glasschrank' },
      descI18n: { ru: 'Трёхдверный шкаф с матовым стеклом и дубовыми панелями', en: 'Three-panel wardrobe with frosted glass and oak panels' },
      coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
      tags: ['modern', 'glass', 'wardrobe'],
      isPublished: true,
    },
    {
      slug: 'lacobel-black-doors',
      titleI18n: { ru: 'Двери из лакобеля', en: 'Lacobel Black Doors', de: 'Lacobel Schwarztüren' },
      descI18n: { ru: 'Раздвижные двери из чёрного лакобеля в минималистичном интерьере', en: 'Sliding doors from black lacobel in minimalist interior' },
      coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
      tags: ['lacobel', 'black', 'minimalist'],
      isPublished: true,
    },
    {
      slug: 'mirror-bedroom',
      titleI18n: { ru: 'Зеркальные двери спальни', en: 'Mirror Bedroom Doors', de: 'Spiegelschlafzimmertüren' },
      descI18n: { ru: 'Встроенный зеркальный шкаф с раздвижными дверями', en: 'Built-in mirror wardrobe with sliding doors' },
      coverImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'],
      tags: ['mirror', 'bedroom', 'built-in'],
      isPublished: true,
    },
  ];

  for (const item of portfolioItems) {
    const exists = await prisma.portfolioItem.findUnique({ where: { slug: item.slug } });
    if (!exists) {
      await prisma.portfolioItem.create({ data: item });
      console.log(`✓ Portfolio: ${item.slug}`);
    }
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
