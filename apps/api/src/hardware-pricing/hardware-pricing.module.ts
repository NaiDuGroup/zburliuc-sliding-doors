import { Module } from '@nestjs/common';
import { HardwarePricingController } from './hardware-pricing.controller';
import { HardwarePricingService } from './hardware-pricing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HardwarePricingController],
  providers: [HardwarePricingService],
  exports: [HardwarePricingService],
})
export class HardwarePricingModule {}
