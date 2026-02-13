import { FinancialEntryStatus, FinancialEntryType } from '@prisma/client';
export declare class CreateFinancialEntryDto {
    type: FinancialEntryType;
    description: string;
    amount: number;
    dueDate?: string;
    clientId?: string;
}
export declare class UpdateFinancialEntryDto {
    description?: string;
    amount?: number;
    dueDate?: string;
    status?: FinancialEntryStatus;
    paidAt?: string;
}
