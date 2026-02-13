import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: {
    actorUserId?: string;
    actorRole?: UserRole;
    action: string;
    entityType: string;
    entityId?: string;
    sourcePlatform: 'WEB' | 'ANDROID' | 'IOS' | 'API';
    details?: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        sourcePlatform: input.sourcePlatform,
        details: (input.details ?? undefined) as any,
      },
    });
  }

  list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
