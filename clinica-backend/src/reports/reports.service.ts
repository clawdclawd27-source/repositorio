import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private dateFilter(from?: string, to?: string) {
    if (!from && !to) return undefined;
    return {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
  }

  async financial(from?: string, to?: string) {
    const where = { createdAt: this.dateFilter(from, to) } as any;

    const grouped = await this.prisma.financialEntry.groupBy({
      by: ['type', 'status'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    const paidIncome = grouped
      .filter((g) => g.type === 'INCOME' && g.status === 'PAID')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    const paidExpense = grouped
      .filter((g) => g.type === 'EXPENSE' && g.status === 'PAID')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    const pendingTotal = grouped
      .filter((g) => g.status === 'PENDING')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    return {
      paidIncome,
      paidExpense,
      net: paidIncome - paidExpense,
      pendingTotal,
      breakdown: grouped,
    };
  }

  async appointments(from?: string, to?: string) {
    const where = { startsAt: this.dateFilter(from, to) } as any;

    const byStatus = await this.prisma.appointment.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const byService = await this.prisma.appointment.groupBy({
      by: ['serviceId'],
      where,
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const serviceIds = byService.map((s) => s.serviceId);
    const services = await this.prisma.service.findMany({ where: { id: { in: serviceIds } } });

    return {
      byStatus,
      topServices: byService.map((s) => ({
        serviceId: s.serviceId,
        serviceName: services.find((x) => x.id === s.serviceId)?.name || 'N/A',
        count: s._count._all,
      })),
    };
  }

  async referrals(from?: string, to?: string) {
    const where = { createdAt: this.dateFilter(from, to) } as any;

    const grouped = await this.prisma.referral.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const total = grouped.reduce((acc, g) => acc + g._count._all, 0);
    const converted = grouped.find((g) => g.status === 'CONVERTED')?._count._all || 0;

    return {
      total,
      converted,
      conversionRate: total > 0 ? Number(((converted / total) * 100).toFixed(2)) : 0,
      byStatus: grouped,
    };
  }

  async inventory() {
    const items = await this.prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
      include: { movements: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });

    const lowStock = items.filter((i) => Number(i.currentQty) <= Number(i.minQty));

    return {
      totalItems: items.length,
      lowStockCount: lowStock.length,
      lowStock,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        currentQty: Number(i.currentQty),
        minQty: Number(i.minQty),
        active: i.active,
      })),
    };
  }
}
