import { Prisma, PrismaClient, StockMovementType } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
  { name: 'Álcool 70%', sku: 'INS-001', category: 'Assepsia', unit: 'ml', currentQty: 8000, minQty: 2000, costPrice: 0.03, salePrice: 0.08 },
  { name: 'Luva Procedimento M', sku: 'INS-002', category: 'Descartáveis', unit: 'un', currentQty: 450, minQty: 120, costPrice: 0.75, salePrice: 1.8 },
  { name: 'Gaze Estéril', sku: 'INS-003', category: 'Descartáveis', unit: 'un', currentQty: 900, minQty: 200, costPrice: 0.22, salePrice: 0.7 },
  { name: 'Seringa 5ml', sku: 'INS-004', category: 'Aplicação', unit: 'un', currentQty: 260, minQty: 80, costPrice: 0.95, salePrice: 2.4 },
  { name: 'Agulha 30G', sku: 'INS-005', category: 'Aplicação', unit: 'un', currentQty: 300, minQty: 100, costPrice: 0.65, salePrice: 1.9 },
  { name: 'Creme Pós-Procedimento', sku: 'INS-006', category: 'Dermocosmético', unit: 'un', currentQty: 42, minQty: 15, costPrice: 38, salePrice: 79 },
  { name: 'Máscara Descartável', sku: 'INS-007', category: 'Descartáveis', unit: 'un', currentQty: 600, minQty: 150, costPrice: 0.42, salePrice: 1.3 },
  { name: 'Touca Descartável', sku: 'INS-008', category: 'Descartáveis', unit: 'un', currentQty: 340, minQty: 120, costPrice: 0.31, salePrice: 0.95 },
  { name: 'Soro Fisiológico', sku: 'INS-009', category: 'Assepsia', unit: 'ml', currentQty: 15000, minQty: 4000, costPrice: 0.02, salePrice: 0.05 },
  { name: 'Gel Condutor', sku: 'INS-010', category: 'Equipamentos', unit: 'ml', currentQty: 5200, minQty: 1500, costPrice: 0.04, salePrice: 0.11 },
  { name: 'Lençol Descartável', sku: 'INS-011', category: 'Descartáveis', unit: 'un', currentQty: 210, minQty: 90, costPrice: 1.8, salePrice: 4.9 },
  { name: 'Anestésico Tópico', sku: 'INS-012', category: 'Dermocosmético', unit: 'un', currentQty: 28, minQty: 10, costPrice: 55, salePrice: 119 },
];

async function upsertItems() {
  let created = 0;
  let updated = 0;

  for (const i of items) {
    const existing = await prisma.inventoryItem.findFirst({ where: { OR: [{ sku: i.sku }, { name: i.name }] } });

    if (!existing) {
      await prisma.inventoryItem.create({
        data: {
          name: i.name,
          sku: i.sku,
          category: i.category,
          unit: i.unit,
          currentQty: new Prisma.Decimal(i.currentQty),
          minQty: new Prisma.Decimal(i.minQty),
          costPrice: new Prisma.Decimal(i.costPrice),
          salePrice: new Prisma.Decimal(i.salePrice),
          active: true,
        },
      });
      created++;
    } else {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          name: i.name,
          sku: i.sku,
          category: i.category,
          unit: i.unit,
          currentQty: new Prisma.Decimal(i.currentQty),
          minQty: new Prisma.Decimal(i.minQty),
          costPrice: new Prisma.Decimal(i.costPrice),
          salePrice: new Prisma.Decimal(i.salePrice),
          active: true,
        },
      });
      updated++;
    }
  }

  return { created, updated };
}

async function seedMovements() {
  const all = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  let created = 0;

  for (const item of all.slice(0, 8)) {
    const inReason = `Carga inicial automática (${item.name})`;
    const outReason = `Consumo simulado (${item.name})`;

    const hasIn = await prisma.stockMovement.findFirst({ where: { itemId: item.id, type: StockMovementType.IN, reason: inReason } });
    if (!hasIn) {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          type: StockMovementType.IN,
          quantity: new Prisma.Decimal(10),
          reason: inReason,
        },
      });
      created++;
    }

    const hasOut = await prisma.stockMovement.findFirst({ where: { itemId: item.id, type: StockMovementType.OUT, reason: outReason } });
    if (!hasOut) {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          type: StockMovementType.OUT,
          quantity: new Prisma.Decimal(2),
          reason: outReason,
        },
      });
      created++;
    }
  }

  return created;
}

async function main() {
  const itemsResult = await upsertItems();
  const movementsCreated = await seedMovements();
  const totalItems = await prisma.inventoryItem.count();

  console.log(JSON.stringify({ ok: true, itemsResult, movementsCreated, totalItems }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
