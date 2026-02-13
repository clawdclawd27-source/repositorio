import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto, UpdateReferralStatusDto } from './dto';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  list() {
    return this.prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      include: { referrerClient: true },
    });
  }

  async create(dto: CreateReferralDto, actor: { id: string; role: UserRole }) {
    const referral = await this.prisma.referral.create({
      data: {
        ...dto,
        createdById: actor.id,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_REFERRAL',
      entityType: 'REFERRAL',
      entityId: referral.id,
      sourcePlatform: 'API',
      details: { referredName: referral.referredName },
    });

    return referral;
  }

  async updateStatus(id: string, dto: UpdateReferralStatusDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.referral.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_REFERRAL_STATUS',
      entityType: 'REFERRAL',
      entityId: updated.id,
      sourcePlatform: 'API',
      details: { status: updated.status },
    });

    return updated;
  }
}
