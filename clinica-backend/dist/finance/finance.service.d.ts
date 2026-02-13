import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from './dto';
export declare class FinanceService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): Prisma.PrismaPromise<({
        client: {
            id: string;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            cpf: string | null;
            birthDate: Date | null;
            email: string | null;
            phone: string | null;
            emergencyContact: string | null;
            allergies: string | null;
            contraindications: string | null;
            notes: string | null;
        } | null;
    } & {
        id: string;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        description: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    summary(): Promise<{
        totalIncome: number;
        totalExpense: number;
        cashBalance: number;
        pending: number;
    }>;
    create(dto: CreateFinancialEntryDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        description: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateFinancialEntryDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        description: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
