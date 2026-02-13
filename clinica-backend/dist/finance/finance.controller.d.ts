import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from './dto';
import { FinanceService } from './finance.service';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    create(dto: CreateFinancialEntryDto, req: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        description: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateFinancialEntryDto, req: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.FinancialEntryType;
        status: import(".prisma/client").$Enums.FinancialEntryStatus;
        description: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
