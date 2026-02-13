import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from './dto';
import { FinanceService } from './finance.service';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
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
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    })[]>;
    summary(): Promise<{
        totalIncome: number;
        totalExpense: number;
        cashBalance: number;
        pending: number;
    }>;
    create(dto: CreateFinancialEntryDto, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string;
        dueDate: Date | null;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
    update(id: string, dto: UpdateFinancialEntryDto, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string;
        dueDate: Date | null;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
}
