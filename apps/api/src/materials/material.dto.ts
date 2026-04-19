import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class I18nStringDto {
  @ApiProperty({ example: 'Glass' })
  @IsString()
  @IsNotEmpty()
  en!: string;

  @ApiProperty({ example: 'Стекло' })
  @IsString()
  @IsNotEmpty()
  ru!: string;

  @ApiPropertyOptional({ example: 'Glas' })
  @IsOptional()
  @IsString()
  de?: string;
}

export class CreateMaterialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ type: I18nStringDto })
  @IsObject()
  nameI18n!: Record<string, string>;

  @ApiPropertyOptional({ type: I18nStringDto })
  @IsOptional()
  @IsObject()
  descI18n?: Record<string, string>;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  type!: MaterialType;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  pricePerM2!: number;

  @ApiPropertyOptional({
    example: [{ value: 'clear', labelI18n: { en: 'Clear', ru: 'Прозрачное' } }],
  })
  @IsOptional()
  colorOptions?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
