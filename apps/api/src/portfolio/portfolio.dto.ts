import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePortfolioItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: { en: 'Modern wardrobe', ru: 'Современный шкаф' } })
  @IsObject()
  titleI18n!: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  descI18n?: Record<string, string>;

  @ApiProperty({ example: ['https://...'] })
  @IsArray()
  @IsString({ each: true })
  imageUrls!: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverImage!: string;

  @ApiPropertyOptional({ example: ['modern', 'glass'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePortfolioItemDto extends PartialType(
  CreatePortfolioItemDto,
) {}
