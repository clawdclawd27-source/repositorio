import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, ClientPackageStatus, Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilityQueryDto,
  CalendarViewQueryDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  RescheduleAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto';

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

  private dayStart(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private dayEnd(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private slotLabel(date: Date, slotMinutes: number) {
    const total = date.getHours() * 60 + date.getMinutes();
    const floored = Math.floor(total / slotMinutes) * slotMinutes;
    const hh = String(Math.floor(floored / 60)).padStart(2, '0');
    const mm = String(floored % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private async resolveAppointmentWindow(input: {
    startsAt: string;
    endsAt?: string;
    useServiceDuration?: boolean;
    serviceId: string;
  }) {
    const startsAt = new Date(input.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Data/hora inicial inválida para agendamento');
    }

    if (input.endsAt && !input.useServiceDuration) {
      const endsAt = new Date(input.endsAt);
      return { startsAt, endsAt };
    }

    const service = await this.prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { id: true, durationMinutes: true, active: true },
    });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado para definir duração');
    }
    if (!service.active) {
      throw new BadRequestException('Serviço inativo não pode ser agendado');
    }

    const durationMinutes = service.durationMinutes || 60;
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);
    return { startsAt, endsAt };
  }

  async calendarView(query: CalendarViewQueryDto) {
    const anchor = new Date(query.date);
    const mode = query.mode ?? 'day';
    const slotMinutes = query.slotMinutes ?? 30;

    const from = this.dayStart(anchor);
    const to = new Date(from);
    if (mode === 'week') {
      to.setDate(to.getDate() + 6);
    }
    const rangeEnd = this.dayEnd(to);

    const where: Prisma.AppointmentWhereInput = {
      startsAt: { gte: from, lte: rangeEnd },
      ...(query.status ? { status: query.status } : {}),
      ...(query.professionalId ? { professionalId: query.professionalId } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {}),
    };

    const items = await this.prisma.appointment.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        client: true,
        service: true,
        professional: { select: { id: true, name: true, email: true } },
      },
    });

    const grouped: Record<string, typeof items> = {};
    const slotBuckets: Record<string, Record<string, typeof items>> = {};

    for (const item of items) {
      const dayKey = item.startsAt.toISOString().slice(0, 10);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(item);

      const slot = this.slotLabel(item.startsAt, slotMinutes);
      if (!slotBuckets[dayKey]) slotBuckets[dayKey] = {};
      if (!slotBuckets[dayKey][slot]) slotBuckets[dayKey][slot] = [];
      slotBuckets[dayKey][slot].push(item);
    }

    return {
      mode,
      slotMinutes,
      range: {
        from: from.toISOString(),
        to: rangeEnd.toISOString(),
      },
      total: items.length,
      grouped,
      slotBuckets,
    };
  }

  async availability(query: AvailabilityQueryDto) {
    const slotMinutes = query.slotMinutes ?? 30;
    const workStartHour = query.workStartHour ?? 8;
    const workEndHour = query.workEndHour ?? 18;

    const day = new Date(query.date);
    const from = this.dayStart(day);
    const to = this.dayEnd(day);

    const occupied = await this.prisma.appointment.findMany({
      where: {
        startsAt: { lte: to },
        endsAt: { gte: from },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        ...(query.professionalId ? { professionalId: query.professionalId } : {}),
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        clientId: true,
        professionalId: true,
        status: true,
      },
      orderBy: { startsAt: 'asc' },
    });

    const workStart = new Date(from);
    workStart.setHours(workStartHour, 0, 0, 0);
    const workEnd = new Date(from);
    workEnd.setHours(workEndHour, 0, 0, 0);

    const slots: Array<{
      startsAt: string;
      endsAt: string;
      available: boolean;
      conflicts: number;
    }> = [];

    for (let cursor = new Date(workStart); cursor < workEnd; cursor = new Date(cursor.getTime() + slotMinutes * 60000)) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotMinutes * 60000);
      if (slotEnd > workEnd) break;

      const conflicts = occupied.filter((a) => a.startsAt < slotEnd && a.endsAt > slotStart).length;

      slots.push({
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        available: conflicts === 0,
        conflicts,
      });
    }

    return {
      date: from.toISOString().slice(0, 10),
      professionalId: query.professionalId ?? null,
      slotMinutes,
      workHours: { startHour: workStartHour, endHour: workEndHour },
      totals: {
        slots: slots.length,
        free: slots.filter((s) => s.available).length,
        busy: slots.filter((s) => !s.available).length,
      },
      slots,
    };
  }

  private async validateScheduleConflicts(input: {
    startsAt: Date;
    endsAt: Date;
    clientId: string;
    professionalId?: string;
    excludeAppointmentId?: string;
  }) {
    const bufferMinutes = Number(process.env.APPOINTMENT_BUFFER_MINUTES ?? '10');

    if (Number.isNaN(input.startsAt.getTime()) || Number.isNaN(input.endsAt.getTime())) {
      throw new BadRequestException('Data/hora inválida para agendamento');
    }
    if (input.endsAt <= input.startsAt) {
      throw new BadRequestException('Horário final deve ser maior que horário inicial');
    }
    if (!Number.isFinite(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180) {
      throw new BadRequestException('APPOINTMENT_BUFFER_MINUTES inválido (use 0-180)');
    }

    const conflictStart = new Date(input.startsAt.getTime() - bufferMinutes * 60000);
    const conflictEnd = new Date(input.endsAt.getTime() + bufferMinutes * 60000);
    const statusFilter = { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] as AppointmentStatus[] };

    if (input.professionalId) {
      const professionalConflict = await this.prisma.appointment.findFirst({
        where: {
          professionalId: input.professionalId,
          status: statusFilter,
          startsAt: { lt: conflictEnd },
          endsAt: { gt: conflictStart },
          ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
        },
        select: { id: true, startsAt: true, endsAt: true, clientId: true, status: true },
      });

      if (professionalConflict) {
        throw new ConflictException({
          message: 'Conflito de horário para o profissional',
          bufferMinutes,
          conflict: professionalConflict,
        });
      }
    }

    const clientConflict = await this.prisma.appointment.findFirst({
      where: {
        clientId: input.clientId,
        status: statusFilter,
        startsAt: { lt: conflictEnd },
        endsAt: { gt: conflictStart },
        ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
      },
      select: { id: true, startsAt: true, endsAt: true, professionalId: true, status: true },
    });

    if (clientConflict) {
      throw new ConflictException({
        message: 'Cliente já possui agendamento em conflito de horário',
        bufferMinutes,
        conflict: clientConflict,
      });
    }
  }

  async checkAndCreate(dto: CreateAppointmentDto, actor: { id: string; role: UserRole }) {
    const { startsAt, endsAt } = await this.resolveAppointmentWindow({
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      useServiceDuration: dto.useServiceDuration,
      serviceId: dto.serviceId,
    });

    await this.validateScheduleConflicts({
      startsAt,
      endsAt,
      clientId: dto.clientId,
      professionalId: dto.professionalId,
    });

    return this.create(dto, actor);
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto, actor: { id: string; role: UserRole }) {
    const current = await this.prisma.appointment.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const { startsAt, endsAt } = await this.resolveAppointmentWindow({
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      useServiceDuration: dto.useServiceDuration,
      serviceId: current.serviceId,
    });
    const professionalId = dto.professionalId ?? current.professionalId ?? undefined;

    await this.validateScheduleConflicts({
      startsAt,
      endsAt,
      clientId: current.clientId,
      professionalId,
      excludeAppointmentId: id,
    });

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        startsAt,
        endsAt,
        professionalId,
        notes: dto.notes ?? current.notes,
      },
      include: {
        client: true,
        service: true,
        professional: { select: { id: true, name: true, email: true } },
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'RESCHEDULE_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: updated.id,
      sourcePlatform: 'API',
      details: {
        previousStartsAt: current.startsAt.toISOString(),
        previousEndsAt: current.endsAt.toISOString(),
        newStartsAt: updated.startsAt.toISOString(),
        newEndsAt: updated.endsAt.toISOString(),
      },
    });

    return updated;
  }

  async create(dto: CreateAppointmentDto, actor: { id: string; role: UserRole }) {
    const { startsAt, endsAt } = await this.resolveAppointmentWindow({
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      useServiceDuration: dto.useServiceDuration,
      serviceId: dto.serviceId,
    });

    if (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      throw new BadRequestException('Horário final deve ser maior que horário inicial');
    }

    const created = await this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        serviceId: dto.serviceId,
        professionalId: dto.professionalId,
        startsAt,
        endsAt,
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
    const current = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true, status: true, clientId: true, serviceId: true },
    });

    if (!current) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
      include: { service: true, client: true },
    });

    // Consome 1 sessão automaticamente quando o atendimento vira DONE
    if (current.status !== AppointmentStatus.DONE && dto.status === AppointmentStatus.DONE) {
      const alreadyConsumed = await this.prisma.clientPackageConsumption.findUnique({
        where: { appointmentId: id },
      });

      if (!alreadyConsumed) {
        const now = new Date();
        const pkg = await this.prisma.clientPackage.findFirst({
          where: {
            clientId: current.clientId,
            status: ClientPackageStatus.ACTIVE,
            remainingSessions: { gt: 0 },
            package: { serviceId: current.serviceId },
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
          },
          orderBy: [{ expiresAt: 'asc' }, { purchasedAt: 'asc' }],
        });

        if (pkg) {
          await this.prisma.$transaction(async (tx) => {
            const updatedPkg = await tx.clientPackage.update({
              where: { id: pkg.id },
              data: { remainingSessions: { decrement: 1 } },
            });

            await tx.clientPackageConsumption.create({
              data: {
                clientPackageId: pkg.id,
                appointmentId: id,
                notes: `Consumo automático no atendimento ${id}`,
              },
            });

            if (updatedPkg.remainingSessions <= 0) {
              await tx.clientPackage.update({
                where: { id: pkg.id },
                data: { status: ClientPackageStatus.COMPLETED, remainingSessions: 0 },
              });
            }
          });

          await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'CONSUME_PACKAGE_SESSION',
            entityType: 'CLIENT_PACKAGE',
            entityId: pkg.id,
            sourcePlatform: 'API',
            details: { appointmentId: id, clientId: current.clientId, serviceId: current.serviceId },
          });
        }
      }
    }

    // Estorna sessão automaticamente quando sai de DONE para outro status
    if (current.status === AppointmentStatus.DONE && dto.status !== AppointmentStatus.DONE) {
      const consumption = await this.prisma.clientPackageConsumption.findUnique({
        where: { appointmentId: id },
      });

      if (consumption) {
        const updatedPkg = await this.prisma.$transaction(async (tx) => {
          const pkg = await tx.clientPackage.update({
            where: { id: consumption.clientPackageId },
            data: {
              remainingSessions: { increment: 1 },
              status: ClientPackageStatus.ACTIVE,
            },
          });

          await tx.clientPackageConsumption.delete({ where: { appointmentId: id } });
          return pkg;
        });

        await this.audit.log({
          actorUserId: actor.id,
          actorRole: actor.role,
          action: 'REVERT_PACKAGE_SESSION_CONSUMPTION',
          entityType: 'CLIENT_PACKAGE',
          entityId: updatedPkg.id,
          sourcePlatform: 'API',
          details: { appointmentId: id, clientId: current.clientId, fromStatus: current.status, toStatus: dto.status },
        });
      }
    }

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
