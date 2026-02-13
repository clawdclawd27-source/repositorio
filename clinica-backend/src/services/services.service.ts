import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(query: ListServicesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ServiceWhereInput = {
      ...(typeof query.active === 'boolean' ? { active: query.active } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({ where, orderBy: { name: 'asc' }, skip, take: pageSize }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateServiceDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.service.create({ data: { ...dto } });
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_SERVICE',
      entityType: 'SERVICE',
      entityId: created.id,
      sourcePlatform: 'API',
    });
    return created;
  }

  async update(id: string, dto: UpdateServiceDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.service.update({ where: { id }, data: { ...dto } });
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_SERVICE',
      entityType: 'SERVICE',
      entityId: updated.id,
      sourcePlatform: 'API',
    });
    return updated;
  }
}
