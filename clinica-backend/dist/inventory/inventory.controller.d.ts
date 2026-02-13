import { CreateInventoryItemDto, CreateStockMovementDto, UpdateInventoryItemDto } from './dto';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    listItems(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        active: boolean;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    lowStock(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        active: boolean;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    createItem(dto: CreateInventoryItemDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        active: boolean;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateItem(id: string, dto: UpdateInventoryItemDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        active: boolean;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    listMovements(): import(".prisma/client").Prisma.PrismaPromise<({
        item: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            active: boolean;
            sku: string | null;
            category: string | null;
            unit: string;
            currentQty: import("@prisma/client/runtime/library").Decimal;
            minQty: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        createdById: string | null;
        type: import(".prisma/client").$Enums.StockMovementType;
        itemId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    })[]>;
    addMovement(dto: CreateStockMovementDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        type: import(".prisma/client").$Enums.StockMovementType;
        itemId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    }>;
}
