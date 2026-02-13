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
            phone: string | null;
            createdAt: Date;
            notes: string | null;
            createdById: string | null;
            updatedAt: Date;
            fullName: string;
            cpf: string | null;
            birthDate: Date | null;
            email: string | null;
            emergencyContact: string | null;
            allergies: string | null;
            contraindications: string | null;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string;
        dueDate: Date | null;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        amount: Prisma.Decimal;
        paidAt: Date | null;
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
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string;
        dueDate: Date | null;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        amount: Prisma.Decimal;
        paidAt: Date | null;
    }>;
    update(id: string, dto: UpdateFinancialEntryDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string;
        dueDate: Date | null;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        amount: Prisma.Decimal;
        paidAt: Date | null;
    }>;
}
