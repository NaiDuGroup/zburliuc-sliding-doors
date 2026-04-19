import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { PricingService } from './pricing.service';

@Module({
  providers: [QuotesService, PricingService],
  controllers: [QuotesController],
})
export class QuotesModule {}
