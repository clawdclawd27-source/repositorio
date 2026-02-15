import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  PortalListAppointmentsQueryDto,
  PortalListReferralsQueryDto,
  UpdatePortalEmailDto,
  UpdatePortalPasswordDto,
  UpdatePortalProfileDto,
} from './dto';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  private ensureClientProfile(user: { clientProfileId?: string | null }) {
    if (!user.clientProfileId) throw new ForbiddenException('Usuário cliente sem vínculo de perfil');
    return user.clientProfileId;
  }

  async me(user: { clientProfileId?: string | null }) {
    const clientId = this.ensureClientProfile(user);
    return this.prisma.client.findUnique({ where: { id: clientId } });
  }

  async updateMe(user: { clientProfileId?: string | null }, dto: UpdatePortalProfileDto) {
    const clientId = this.ensureClientProfile(user);
    return this.prisma.client.update({
      where: { id: clientId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      },
    });
  }

  async updateEmail(user: { sub?: string | null }, dto: UpdatePortalEmailDto) {
    if (!user.sub) throw new ForbiddenException('Usuário inválido');
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing && existing.id !== user.sub) throw new ConflictException('E-mail já está em uso');

    return this.prisma.user.update({
      where: { id: user.sub },
      data: { email: dto.email },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async updatePassword(user: { sub?: string | null }, dto: UpdatePortalPasswordDto) {
    if (!user.sub) throw new ForbiddenException('Usuário inválido');
    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.sub },
      data: { passwordHash },
    });

    return { ok: true };
  }

  async myAppointments(user: { clientProfileId?: string | null }, query: PortalListAppointmentsQueryDto) {
    const clientId = this.ensureClientProfile(user);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AppointmentWhereInput = {
      clientId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        orderBy: { startsAt: 'asc' },
        include: {
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

  async myReferrals(user: { clientProfileId?: string | null }, query: PortalListReferralsQueryDto) {
    const clientId = this.ensureClientProfile(user);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ReferralWhereInput = {
      referrerClientId: clientId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.referral.count({ where }),
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
