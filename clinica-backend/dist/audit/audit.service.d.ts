import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: {
        actorUserId?: string;
        actorRole?: UserRole;
        action: string;
        entityType: string;
        entityId?: string;
        sourcePlatform: 'WEB' | 'ANDROID' | 'IOS' | 'API';
        details?: Record<string, unknown>;
    }): Promise<void>;
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        actorRole: import(".prisma/client").$Enums.UserRole | null;
        action: string;
        entityType: string;
        entityId: string | null;
        sourcePlatform: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        actorUserId: string | null;
    }[]>;
}
