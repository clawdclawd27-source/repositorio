import { PrismaService } from '../prisma/prisma.service';
import { UpsertPermissionDto } from './dto';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
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
