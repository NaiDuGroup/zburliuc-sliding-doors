import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HardwarePricingService } from './hardware-pricing.service';
import { UpdateHardwarePricingDto } from './hardware-pricing.dto';

@ApiTags('hardware-pricing')
@Controller('hardware-pricing')
export class HardwarePricingController {
  constructor(private readonly service: HardwarePricingService) {}

  /** Public endpoint — used by configurator to display pricing info */
  @Get()
  @ApiOperation({ summary: 'Get all hardware pricing items' })
  findAll() {
    return this.service.findAll();
  }

  /** Admin: update a pricing item */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hardware pricing item (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateHardwarePricingDto) {
    return this.service.update(id, dto);
  }
}
