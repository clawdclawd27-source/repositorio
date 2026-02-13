import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async myAppointments(user: { clientProfileId?: string | null }) {
    const clientId = this.ensureClientProfile(user);
    return this.prisma.appointment.findMany({
      where: { clientId },
      orderBy: { startsAt: 'asc' },
      include: { service: true },
    });
  }

  async myReferrals(user: { clientProfileId?: string | null }) {
    const clientId = this.ensureClientProfile(user);
    return this.prisma.referral.findMany({
      where: { referrerClientId: clientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
