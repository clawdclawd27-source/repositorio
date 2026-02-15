import { UserRole } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsOptional()
  @IsEnum(UserRole)
  accountRole?: UserRole;

  @IsOptional()
  @IsEmail()
  loginEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  loginPassword?: string;
}

export class UpdateClientDto extends CreateClientDto {}

export class UpdateClientAccessRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
