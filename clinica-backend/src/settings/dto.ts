import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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
