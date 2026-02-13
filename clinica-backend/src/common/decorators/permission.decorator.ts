import { SetMetadata } from '@nestjs/common';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export const PERMISSION_KEY = 'permission';

export const Permission = (moduleKey: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { moduleKey, action });
