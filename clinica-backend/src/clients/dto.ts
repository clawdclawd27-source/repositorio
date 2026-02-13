import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  contraindications?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateClientDto extends CreateClientDto {}
