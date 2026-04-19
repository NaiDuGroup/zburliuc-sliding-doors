import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MaterialsModule } from '../materials/materials.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { QuotesModule } from '../quotes/quotes.module';
import { HardwarePricingModule } from '../hardware-pricing/hardware-pricing.module';
import { SitemapController } from './sitemap.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MaterialsModule,
    PortfolioModule,
    QuotesModule,
    HardwarePricingModule,
  ],
  controllers: [SitemapController],
})
export class AppModule {}
