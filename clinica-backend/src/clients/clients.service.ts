import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async create(dto: CreateClientDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.client.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        createdById: actor.id,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_CLIENT',
      entityType: 'CLIENT',
      entityId: created.id,
      sourcePlatform: 'API',
      details: { fullName: created.fullName },
    });

    return created;
  }

  async update(id: string, dto: UpdateClientDto, actor: { id: string; role: UserRole }) {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_CLIENT',
      entityType: 'CLIENT',
      entityId: updated.id,
      sourcePlatform: 'API',
    });

    return updated;
  }

  async remove(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');

    const [appointments, packages, tasks, finance, referrals] = await this.prisma.$transaction([
      this.prisma.appointment.count({ where: { clientId: id } }),
      this.prisma.clientPackage.count({ where: { clientId: id } }),
      this.prisma.task.count({ where: { clientId: id } }),
      this.prisma.financialEntry.count({ where: { clientId: id } }),
      this.prisma.referral.count({ where: { referrerClientId: id } }),
    ]);

    const linked = appointments + packages + tasks + finance + referrals;
    if (linked > 0) {
      throw new BadRequestException('Cliente possui histórico vinculado e não pode ser apagado.');
    }

    await this.prisma.client.delete({ where: { id } });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'DELETE_CLIENT',
      entityType: 'CLIENT',
      entityId: id,
      sourcePlatform: 'API',
    });

    return { ok: true };
  }
}
