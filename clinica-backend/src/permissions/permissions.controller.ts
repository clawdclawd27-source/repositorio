import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpsertPermissionDto } from './dto';
import { ImportPermissionsDto } from './import.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  list() {
    return this.permissionsService.list();
  }

  @Post()
  upsert(@Body() dto: UpsertPermissionDto) {
    return this.permissionsService.upsert(dto);
  }

  @Post('reset-defaults')
  resetDefaults() {
    return this.permissionsService.resetDefaults();
  }

  @Get('default-json')
  defaultJson() {
    return this.permissionsService.exportDefaults();
  }

  @Post('import-json')
  importJson(@Body() dto: ImportPermissionsDto) {
    return this.permissionsService.importPermissions(dto);
  }
}
