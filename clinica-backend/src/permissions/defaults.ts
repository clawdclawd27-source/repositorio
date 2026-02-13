import { UserRole } from '@prisma/client';

export const DEFAULT_PERMISSION_MODULES = [
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

export function buildDefaultPermission(role: UserRole, moduleKey: string) {
  const isAdmin = role === UserRole.ADMIN;
  const isOwner = role === UserRole.OWNER;

  const canView = isAdmin || isOwner;
  const canCreate = isAdmin || (isOwner && moduleKey !== 'permissions' && moduleKey !== 'audit_logs');
  const canEdit = isAdmin || (isOwner && moduleKey !== 'permissions' && moduleKey !== 'audit_logs');
  const canDelete = isAdmin;

  return { role, moduleKey, canView, canCreate, canEdit, canDelete };
}
