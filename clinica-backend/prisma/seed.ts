import { PrismaClient, UserRole } from '@prisma/client';
import { buildDefaultPermission, DEFAULT_PERMISSION_MODULES } from '../src/permissions/defaults';

const prisma = new PrismaClient();

async function upsertPermission(role: UserRole, moduleKey: string) {
  const perm = buildDefaultPermission(role, moduleKey);
  await prisma.rolePermission.upsert({
    where: { role_moduleKey: { role, moduleKey } },
    update: perm,
    create: perm,
  });
}

async function main() {
  for (const m of DEFAULT_PERMISSION_MODULES) {
    await upsertPermission(UserRole.ADMIN, m);
    await upsertPermission(UserRole.OWNER, m);
  }

  await prisma.rolePermission.upsert({
    where: { role_moduleKey: { role: UserRole.CLIENT, moduleKey: 'referrals' } },
    update: { canView: false, canCreate: true, canEdit: false, canDelete: false },
    create: { role: UserRole.CLIENT, moduleKey: 'referrals', canView: false, canCreate: true, canEdit: false, canDelete: false },
  });

  console.log('✅ Permissões iniciais aplicadas com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
