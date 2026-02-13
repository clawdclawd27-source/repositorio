import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTreatmentPackageDto {
  @IsString()
  name!: string;

  @IsString()
  serviceId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSessions!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  validityDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTreatmentPackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSessions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  validityDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class SellPackageDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePaid?: number;

  @IsOptional()
  @IsDateString()
  purchasedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListPackagesQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class ListPackageConsumptionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
