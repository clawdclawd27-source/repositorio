import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditLogsQueryDto } from './dto';

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

  async list(query: ListAuditLogsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.actorRole ? { actorRole: query.actorRole } : {}),
      ...(query.sourcePlatform ? { sourcePlatform: query.sourcePlatform } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          actorUser: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
