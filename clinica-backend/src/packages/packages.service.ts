import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientPackageStatus, Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTreatmentPackageDto,
  ListPackagesQueryDto,
  SellPackageDto,
  UpdateTreatmentPackageDto,
} from './dto';

@Injectable()
export class PackagesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(query: ListPackagesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.TreatmentPackageWhereInput = {
      ...(typeof query.active === 'boolean' ? { active: query.active } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { service: { name: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.treatmentPackage.findMany({
        where,
        include: { service: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.treatmentPackage.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateTreatmentPackageDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.treatmentPackage.create({
      data: {
        name: dto.name,
        serviceId: dto.serviceId,
        totalSessions: dto.totalSessions,
        totalPrice: new Prisma.Decimal(dto.totalPrice),
        validityDays: dto.validityDays ?? 180,
        active: dto.active ?? true,
      },
      include: { service: true },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_TREATMENT_PACKAGE',
      entityType: 'TREATMENT_PACKAGE',
      entityId: created.id,
      sourcePlatform: 'API',
    });

    return created;
  }

  async update(id: string, dto: UpdateTreatmentPackageDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.treatmentPackage.update({
      where: { id },
      data: {
        name: dto.name,
        totalSessions: dto.totalSessions,
        totalPrice: dto.totalPrice !== undefined ? new Prisma.Decimal(dto.totalPrice) : undefined,
        validityDays: dto.validityDays,
        active: dto.active,
      },
      include: { service: true },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_TREATMENT_PACKAGE',
      entityType: 'TREATMENT_PACKAGE',
      entityId: updated.id,
      sourcePlatform: 'API',
    });

    return updated;
  }

  async sell(packageId: string, dto: SellPackageDto, actor: { id: string; role: UserRole }) {
    const pkg = await this.prisma.treatmentPackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Pacote não encontrado');

    const purchasedAt = dto.purchasedAt ? new Date(dto.purchasedAt) : new Date();
    const expiresAt = new Date(purchasedAt.getTime() + pkg.validityDays * 24 * 60 * 60000);

    const sold = await this.prisma.clientPackage.create({
      data: {
        clientId: dto.clientId,
        packageId,
        totalSessions: pkg.totalSessions,
        remainingSessions: pkg.totalSessions,
        pricePaid: dto.pricePaid !== undefined ? new Prisma.Decimal(dto.pricePaid) : pkg.totalPrice,
        purchasedAt,
        expiresAt,
        status: ClientPackageStatus.ACTIVE,
        notes: dto.notes,
        createdById: actor.id,
      },
      include: {
        client: true,
        package: { include: { service: true } },
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'SELL_TREATMENT_PACKAGE',
      entityType: 'CLIENT_PACKAGE',
      entityId: sold.id,
      sourcePlatform: 'API',
      details: {
        packageId,
        clientId: dto.clientId,
        totalSessions: sold.totalSessions,
      },
    });

    return sold;
  }

  async clientBalances(clientId: string) {
    const now = new Date();
    return this.prisma.clientPackage.findMany({
      where: {
        clientId,
        status: { in: [ClientPackageStatus.ACTIVE, ClientPackageStatus.COMPLETED, ClientPackageStatus.EXPIRED] },
      },
      include: { package: { include: { service: true } } },
      orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
    }).then((rows) =>
      rows.map((r) => ({
        ...r,
        computedStatus:
          r.status === ClientPackageStatus.ACTIVE && r.expiresAt && r.expiresAt < now
            ? ClientPackageStatus.EXPIRED
            : r.status,
      })),
    );
  }
}
