import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  list() {
    return this.prisma.appointment.findMany({
      orderBy: { startsAt: 'asc' },
      include: { client: true, service: true, professional: true },
    });
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
