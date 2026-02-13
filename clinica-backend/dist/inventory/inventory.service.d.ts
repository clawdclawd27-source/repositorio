import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto, CreateStockMovementDto, UpdateInventoryItemDto } from './dto';
export declare class InventoryService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    listItems(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: Prisma.Decimal;
        minQty: Prisma.Decimal;
        costPrice: Prisma.Decimal | null;
        salePrice: Prisma.Decimal | null;
        active: boolean;
    }[]>;
    lowStock(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: Prisma.Decimal;
        minQty: Prisma.Decimal;
        costPrice: Prisma.Decimal | null;
        salePrice: Prisma.Decimal | null;
        active: boolean;
    }[]>;
    createItem(dto: CreateInventoryItemDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: Prisma.Decimal;
        minQty: Prisma.Decimal;
        costPrice: Prisma.Decimal | null;
        salePrice: Prisma.Decimal | null;
        active: boolean;
    }>;
    updateItem(id: string, dto: UpdateInventoryItemDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: Prisma.Decimal;
        minQty: Prisma.Decimal;
        costPrice: Prisma.Decimal | null;
        salePrice: Prisma.Decimal | null;
        active: boolean;
    }>;
    addMovement(dto: CreateStockMovementDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.StockMovementType;
        createdById: string | null;
        createdAt: Date;
        itemId: string;
        quantity: Prisma.Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    }>;
    listMovements(): Prisma.PrismaPromise<({
        item: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sku: string | null;
            category: string | null;
            unit: string;
            currentQty: Prisma.Decimal;
            minQty: Prisma.Decimal;
            costPrice: Prisma.Decimal | null;
            salePrice: Prisma.Decimal | null;
            active: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.StockMovementType;
        createdById: string | null;
        createdAt: Date;
        itemId: string;
        quantity: Prisma.Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    })[]>;
}
