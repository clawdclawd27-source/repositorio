import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY, PermissionAction } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ moduleKey: string; action: PermissionAction }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.CLIENT) {
      return required.moduleKey === 'referrals' && required.action === 'create';
    }

    const perm = await this.prisma.rolePermission.findUnique({
      where: { role_moduleKey: { role: user.role, moduleKey: required.moduleKey } },
    });

    if (!perm) return user.role === UserRole.OWNER;

    if (required.action === 'view') return perm.canView;
    if (required.action === 'create') return perm.canCreate;
    if (required.action === 'edit') return perm.canEdit;
    return perm.canDelete;
  }
}
