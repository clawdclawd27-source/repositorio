import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto, CreateStockMovementDto, UpdateInventoryItemDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  listItems() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  lowStock() {
    return this.prisma.inventoryItem.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }).then((items) => items.filter((i) => Number(i.currentQty) <= Number(i.minQty)));
  }

  createItem(dto: CreateInventoryItemDto, actor: { id: string; role: UserRole }) {
    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        category: dto.category,
        unit: dto.unit ?? 'un',
        currentQty: new Prisma.Decimal(dto.currentQty),
        minQty: new Prisma.Decimal(dto.minQty),
        costPrice: dto.costPrice !== undefined ? new Prisma.Decimal(dto.costPrice) : undefined,
        salePrice: dto.salePrice !== undefined ? new Prisma.Decimal(dto.salePrice) : undefined,
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

  updateItem(id: string, dto: UpdateInventoryItemDto, actor: { id: string; role: UserRole }) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        minQty: dto.minQty !== undefined ? new Prisma.Decimal(dto.minQty) : undefined,
        costPrice: dto.costPrice !== undefined ? new Prisma.Decimal(dto.costPrice) : undefined,
        salePrice: dto.salePrice !== undefined ? new Prisma.Decimal(dto.salePrice) : undefined,
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

  async addMovement(dto: CreateStockMovementDto, actor: { id: string; role: UserRole }) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new BadRequestException('Item de estoque não encontrado');

    const qty = new Prisma.Decimal(dto.quantity);
    let delta = qty;
    if (dto.type === 'OUT') delta = qty.neg();

    const nextQty = new Prisma.Decimal(item.currentQty).add(delta);
    if (nextQty.lessThan(0)) throw new BadRequestException('Quantidade não pode ficar negativa');

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
}
