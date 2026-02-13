import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPermissionDto } from './dto';

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
}
