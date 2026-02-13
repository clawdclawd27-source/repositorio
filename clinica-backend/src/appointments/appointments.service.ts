import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, ListAppointmentsQueryDto, UpdateAppointmentStatusDto } from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(query: ListAppointmentsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AppointmentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.professionalId ? { professionalId: query.professionalId } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...((query.from || query.to)
        ? {
            startsAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        orderBy: { startsAt: 'asc' },
        include: {
          client: true,
          service: true,
          professional: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: pageSize,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateAppointmentDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        serviceId: dto.serviceId,
        professionalId: dto.professionalId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        notes: dto.notes,
        createdById: actor.id,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: created.id,
      sourcePlatform: 'API',
    });

    return created;
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_APPOINTMENT_STATUS',
      entityType: 'APPOINTMENT',
      entityId: updated.id,
      sourcePlatform: 'API',
      details: { status: updated.status },
    });

    return updated;
  }
}
