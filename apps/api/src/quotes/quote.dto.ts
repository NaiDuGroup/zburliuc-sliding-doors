import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SectionConfigDto {
  @ApiProperty({ description: 'Material ID' })
  @IsString()
  @IsNotEmpty()
  materialId!: string;

  @ApiProperty({ description: 'Color variant value' })
  @IsOptional()
  @IsString()
  colorValue?: string;

  @ApiProperty({ description: 'Height ratio 0..1 (fraction of panel height)' })
  @IsNumber()
  @Min(0.1)
  @Max(1)
  heightRatio!: number;
}

export class PanelConfigDto {
  @ApiProperty({ type: [SectionConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionConfigDto)
  sections!: SectionConfigDto[];
}

export class DoorConfigurationDto {
  @ApiProperty({ description: 'Opening width in mm', minimum: 300 })
  @IsNumber()
  @Min(300)
  openingWidth!: number;

  @ApiProperty({ description: 'Opening height in mm', minimum: 500 })
  @IsNumber()
  @Min(500)
  openingHeight!: number;

  @ApiProperty({ type: [PanelConfigDto], description: 'Array of door panels' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PanelConfigDto)
  panels!: PanelConfigDto[];
}

export class CreateQuoteDto {
  @ApiProperty({ type: DoorConfigurationDto })
  @ValidateNested()
  @Type(() => DoorConfigurationDto)
  configuration!: DoorConfigurationDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientComment?: string;
}

export class PriceCalculationDto {
  @ApiProperty({ type: DoorConfigurationDto })
  @ValidateNested()
  @Type(() => DoorConfigurationDto)
  configuration!: DoorConfigurationDto;
}

export class PriceBreakdownDto {
  @ApiProperty()
  totalPrice!: number;

  @ApiProperty()
  materialsPrice!: number;

  @ApiProperty()
  hardwarePrice!: number;

  @ApiProperty()
  framePrice!: number;

  @ApiProperty()
  currency!: string;
}
