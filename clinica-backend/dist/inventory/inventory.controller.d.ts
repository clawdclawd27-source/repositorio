import { CreateInventoryItemDto, CreateStockMovementDto, UpdateInventoryItemDto } from './dto';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    listItems(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
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
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
        active: boolean;
    }[]>;
    createItem(dto: CreateInventoryItemDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
        active: boolean;
    }>;
    updateItem(id: string, dto: UpdateInventoryItemDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string | null;
        category: string | null;
        unit: string;
        currentQty: import("@prisma/client/runtime/library").Decimal;
        minQty: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        salePrice: import("@prisma/client/runtime/library").Decimal | null;
        active: boolean;
    }>;
    listMovements(): import(".prisma/client").Prisma.PrismaPromise<({
        item: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sku: string | null;
            category: string | null;
            unit: string;
            currentQty: import("@prisma/client/runtime/library").Decimal;
            minQty: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            active: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.StockMovementType;
        createdById: string | null;
        createdAt: Date;
        itemId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    })[]>;
    addMovement(dto: CreateStockMovementDto, req: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.StockMovementType;
        createdById: string | null;
        createdAt: Date;
        itemId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
        referenceType: string | null;
        referenceId: string | null;
    }>;
}
