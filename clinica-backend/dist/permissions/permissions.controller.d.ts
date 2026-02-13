import { UpsertPermissionDto } from './dto';
import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private permissionsService;
    constructor(permissionsService: PermissionsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        moduleKey: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }[]>;
    upsert(dto: UpsertPermissionDto): import(".prisma/client").Prisma.Prisma__RolePermissionClient<{
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        moduleKey: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
