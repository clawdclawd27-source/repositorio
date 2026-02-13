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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    listItems() {
        return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    }
    lowStock() {
        return this.prisma.inventoryItem.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        }).then((items) => items.filter((i) => Number(i.currentQty) <= Number(i.minQty)));
    }
    createItem(dto, actor) {
        return this.prisma.inventoryItem.create({
            data: {
                name: dto.name,
                sku: dto.sku,
                category: dto.category,
                unit: dto.unit ?? 'un',
                currentQty: new client_1.Prisma.Decimal(dto.currentQty),
                minQty: new client_1.Prisma.Decimal(dto.minQty),
                costPrice: dto.costPrice !== undefined ? new client_1.Prisma.Decimal(dto.costPrice) : undefined,
                salePrice: dto.salePrice !== undefined ? new client_1.Prisma.Decimal(dto.salePrice) : undefined,
                active: dto.active ?? true,
            },
        }).then(async (created) => {
            await this.audit.log({
                actorUserId: actor.id,
                actorRole: actor.role,
                action: 'CREATE_INVENTORY_ITEM',
                entityType: 'INVENTORY_ITEM',
                entityId: created.id,
                sourcePlatform: 'API',
            });
            return created;
        });
    }
    updateItem(id, dto, actor) {
        return this.prisma.inventoryItem.update({
            where: { id },
            data: {
                name: dto.name,
                category: dto.category,
                unit: dto.unit,
                minQty: dto.minQty !== undefined ? new client_1.Prisma.Decimal(dto.minQty) : undefined,
                costPrice: dto.costPrice !== undefined ? new client_1.Prisma.Decimal(dto.costPrice) : undefined,
                salePrice: dto.salePrice !== undefined ? new client_1.Prisma.Decimal(dto.salePrice) : undefined,
                active: dto.active,
            },
        }).then(async (updated) => {
            await this.audit.log({
                actorUserId: actor.id,
                actorRole: actor.role,
                action: 'UPDATE_INVENTORY_ITEM',
                entityType: 'INVENTORY_ITEM',
                entityId: updated.id,
                sourcePlatform: 'API',
            });
            return updated;
        });
    }
    async addMovement(dto, actor) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
        if (!item)
            throw new common_1.BadRequestException('Item de estoque não encontrado');
        const qty = new client_1.Prisma.Decimal(dto.quantity);
        let delta = qty;
        if (dto.type === 'OUT')
            delta = qty.neg();
        const nextQty = new client_1.Prisma.Decimal(item.currentQty).add(delta);
        if (nextQty.lessThan(0))
            throw new common_1.BadRequestException('Quantidade não pode ficar negativa');
        const [movement] = await this.prisma.$transaction([
            this.prisma.stockMovement.create({
                data: {
                    itemId: dto.itemId,
                    type: dto.type,
                    quantity: qty,
                    reason: dto.reason,
                    createdById: actor.id,
                },
            }),
            this.prisma.inventoryItem.update({
                where: { id: dto.itemId },
                data: { currentQty: nextQty },
            }),
        ]);
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'CREATE_STOCK_MOVEMENT',
            entityType: 'STOCK_MOVEMENT',
            entityId: movement.id,
            sourcePlatform: 'API',
            details: { type: dto.type, quantity: dto.quantity },
        });
        return movement;
    }
    listMovements() {
        return this.prisma.stockMovement.findMany({
            orderBy: { createdAt: 'desc' },
            include: { item: true },
            take: 500,
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map