import { UserRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class UpsertPermissionDto {
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
