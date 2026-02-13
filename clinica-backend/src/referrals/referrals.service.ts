import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto, ListReferralsQueryDto, UpdateReferralStatusDto } from './dto';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(query: ListReferralsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ReferralWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.referrerClientId ? { referrerClientId: query.referrerClientId } : {}),
      ...(query.search
        ? {
            OR: [
              { referredName: { contains: query.search, mode: 'insensitive' } },
              { referredPhone: { contains: query.search, mode: 'insensitive' } },
              { referredEmail: { contains: query.search, mode: 'insensitive' } },
              {
                referrerClient: {
                  fullName: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { referrerClient: true },
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

  async getById(id: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: { referrerClient: true },
    });

    if (!referral) {
      throw new NotFoundException('Indicação não encontrada');
    }

    return referral;
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
