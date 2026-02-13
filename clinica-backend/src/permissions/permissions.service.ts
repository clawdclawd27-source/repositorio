import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPermissionDto } from './dto';
import { buildDefaultPermission, DEFAULT_PERMISSION_MODULES } from './defaults';
import { ImportPermissionsDto } from './import.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.rolePermission.findMany({ orderBy: [{ role: 'asc' }, { moduleKey: 'asc' }] });
  }

  upsert(dto: UpsertPermissionDto) {
    return this.prisma.rolePermission.upsert({
      where: { role_moduleKey: { role: dto.role, moduleKey: dto.moduleKey } },
      update: dto,
      create: dto,
    });
  }

  async resetDefaults() {
    for (const moduleKey of DEFAULT_PERMISSION_MODULES) {
      for (const role of [UserRole.ADMIN, UserRole.OWNER]) {
        const perm = buildDefaultPermission(role, moduleKey);
        await this.prisma.rolePermission.upsert({
          where: { role_moduleKey: { role, moduleKey } },
          update: perm,
          create: perm,
        });
      }
    }

    await this.prisma.rolePermission.upsert({
      where: { role_moduleKey: { role: UserRole.CLIENT, moduleKey: 'referrals' } },
      update: { canView: false, canCreate: true, canEdit: false, canDelete: false },
      create: { role: UserRole.CLIENT, moduleKey: 'referrals', canView: false, canCreate: true, canEdit: false, canDelete: false },
    });

    return { ok: true, message: 'Permissões padrão restauradas com sucesso.' };
  }

  exportDefaults() {
    const roles = [UserRole.ADMIN, UserRole.OWNER, UserRole.CLIENT];
    const data = [] as any[];

    for (const role of roles) {
      if (role === UserRole.CLIENT) {
        data.push({ role, moduleKey: 'referrals', canView: false, canCreate: true, canEdit: false, canDelete: false });
        continue;
      }

      for (const moduleKey of DEFAULT_PERMISSION_MODULES) {
        data.push(buildDefaultPermission(role, moduleKey));
      }
    }

    return { version: 1, generatedAt: new Date().toISOString(), permissions: data };
  }

  async importPermissions(input: ImportPermissionsDto) {
    let applied = 0;

    await this.prisma.$transaction(
      input.permissions.map((p) =>
        this.prisma.rolePermission.upsert({
          where: { role_moduleKey: { role: p.role, moduleKey: p.moduleKey } },
          update: {
            canView: p.canView,
            canCreate: p.canCreate,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
          },
          create: {
            role: p.role,
            moduleKey: p.moduleKey,
            canView: p.canView,
            canCreate: p.canCreate,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
          },
        }),
      ),
    );

    applied = input.permissions.length;
    return { ok: true, applied, version: input.version ?? 1 };
  }
}
