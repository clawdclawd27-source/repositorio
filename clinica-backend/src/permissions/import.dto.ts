import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserRole } from '@prisma/client';

class PermissionItemDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  moduleKey!: string;

  @IsBoolean()
  canView!: boolean;

  @IsBoolean()
  canCreate!: boolean;

  @IsBoolean()
  canEdit!: boolean;

  @IsBoolean()
  canDelete!: boolean;
}

export class ImportPermissionsDto {
  @IsOptional()
  @IsInt()
  version?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions!: PermissionItemDto[];
}
