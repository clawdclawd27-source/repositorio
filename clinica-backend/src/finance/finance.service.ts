import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from './dto';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  list() {
    return this.prisma.financialEntry.findMany({
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: { client: true },
    });
  }

  async summary() {
    const grouped = await this.prisma.financialEntry.groupBy({
      by: ['type', 'status'],
      _sum: { amount: true },
    });

    const totalIncome = grouped
      .filter((g) => g.type === 'INCOME' && g.status === 'PAID')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    const totalExpense = grouped
      .filter((g) => g.type === 'EXPENSE' && g.status === 'PAID')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    const pending = grouped
      .filter((g) => g.status === 'PENDING')
      .reduce((acc, g) => acc + Number(g._sum.amount || 0), 0);

    return { totalIncome, totalExpense, cashBalance: totalIncome - totalExpense, pending };
  }

  async create(dto: CreateFinancialEntryDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.financialEntry.create({
      data: {
        type: dto.type,
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        clientId: dto.clientId,
        createdById: actor.id,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_FINANCIAL_ENTRY',
      entityType: 'FINANCIAL_ENTRY',
      entityId: created.id,
      sourcePlatform: 'API',
    });

    return created;
  }

  async update(id: string, dto: UpdateFinancialEntryDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.financialEntry.update({
      where: { id },
      data: {
        description: dto.description,
        amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_FINANCIAL_ENTRY',
      entityType: 'FINANCIAL_ENTRY',
      entityId: updated.id,
      sourcePlatform: 'API',
      details: { status: updated.status },
    });

    return updated;
  }
}
