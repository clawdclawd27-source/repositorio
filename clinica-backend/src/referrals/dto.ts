import { ReferralStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReferralDto {
  @IsString()
  referrerClientId!: string;

  @IsString()
  referredName!: string;

  @IsOptional()
  @IsString()
  referredPhone?: string;

  @IsOptional()
  @IsString()
  referredEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReferralStatusDto {
  @IsEnum(ReferralStatus)
  status!: ReferralStatus;

  @IsOptional()
  @IsString()
  convertedClientId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListReferralsQueryDto {
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

  @IsOptional()
  @IsString()
  referrerClientId?: string;

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
