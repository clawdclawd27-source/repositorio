import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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
