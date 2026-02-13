"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
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
    async create(dto, actor) {
        const created = await this.prisma.financialEntry.create({
            data: {
                type: dto.type,
                description: dto.description,
                amount: new client_1.Prisma.Decimal(dto.amount),
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
    async update(id, dto, actor) {
        const updated = await this.prisma.financialEntry.update({
            where: { id },
            data: {
                description: dto.description,
                amount: dto.amount !== undefined ? new client_1.Prisma.Decimal(dto.amount) : undefined,
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
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map