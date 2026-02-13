import { StockMovementType } from '@prisma/client';
export declare class CreateInventoryItemDto {
    name: string;
    sku?: string;
    category?: string;
    unit?: string;
    currentQty: number;
    minQty: number;
    costPrice?: number;
    salePrice?: number;
    active?: boolean;
}
export declare class UpdateInventoryItemDto {
    name?: string;
    category?: string;
    unit?: string;
    minQty?: number;
    costPrice?: number;
    salePrice?: number;
    active?: boolean;
}
export declare class CreateStockMovementDto {
    itemId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
}
