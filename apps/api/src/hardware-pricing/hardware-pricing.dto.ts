import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateHardwarePricingDto {
  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceFixed?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  labelI18n?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class HardwarePricingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  labelI18n!: Record<string, string>;

  @ApiPropertyOptional()
  priceFixed!: number | null;

  @ApiPropertyOptional()
  pricePerM!: number | null;

  @ApiProperty()
  isActive!: boolean;
}
