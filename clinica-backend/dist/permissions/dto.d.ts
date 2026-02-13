import { UserRole } from '@prisma/client';
export declare class UpsertPermissionDto {
    role: UserRole;
    moduleKey: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}
