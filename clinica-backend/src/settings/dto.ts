import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateClinicProfileDto {
  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class UpdateAgendaSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  workStartHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  workEndHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  slotMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(180)
  bufferMinutes?: number;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  appointmentEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  birthdayEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  startHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  endHour?: number;

  @IsOptional()
  @IsString()
  appointmentTemplate?: string;

  @IsOptional()
  @IsString()
  birthdayTemplate?: string;
}

export class UpdateAdminPasswordDto {
  @IsString()
  @MinLength(6)
  password!: string;
}

export class CreateProfessionalDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateProfessionalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
