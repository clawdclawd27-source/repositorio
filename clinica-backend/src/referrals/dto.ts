import { ReferralStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

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
