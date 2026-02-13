import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  list() {
    return this.prisma.service.findMany({ orderBy: { name: 'asc' } });
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
