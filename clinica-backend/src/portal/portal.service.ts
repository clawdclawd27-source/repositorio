import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PortalListAppointmentsQueryDto, PortalListReferralsQueryDto } from './dto';

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
