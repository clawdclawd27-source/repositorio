import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
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
