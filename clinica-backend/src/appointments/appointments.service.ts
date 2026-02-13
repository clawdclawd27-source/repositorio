import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilityQueryDto,
  CalendarViewQueryDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
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
