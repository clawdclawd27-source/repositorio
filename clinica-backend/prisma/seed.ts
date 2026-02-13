import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const modules = [
  'dashboard',
  'clients',
  'appointments',
  'services',
  'referrals',
  'tasks',
  'birthdays',
  'finance',
  'inventory',
  'reports',
  'notifications',
  'settings',
  'audit_logs',
  'permissions',
];

async function upsertPermission(role: UserRole, moduleKey: string) {
  const isAdmin = role === UserRole.ADMIN;
  const isOwner = role === UserRole.OWNER;

  const canView = isAdmin || isOwner;
  const canCreate = isAdmin || (isOwner && moduleKey !== 'permissions' && moduleKey !== 'audit_logs');
  const canEdit = isAdmin || (isOwner && moduleKey !== 'permissions' && moduleKey !== 'audit_logs');
  const canDelete = isAdmin;

  await prisma.rolePermission.upsert({
    where: { role_moduleKey: { role, moduleKey } },
    update: { canView, canCreate, canEdit, canDelete },
    create: { role, moduleKey, canView, canCreate, canEdit, canDelete },
  });
}

async function main() {
  for (const m of modules) {
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
