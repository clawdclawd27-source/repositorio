import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BirthdaysService } from './birthdays.service';

@Controller('birthdays')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class BirthdaysController {
  constructor(private birthdaysService: BirthdaysService) {}

  @Get()
  @Permission('birthdays', 'view')
  list(@Query('month') month?: string) {
    return this.birthdaysService.list(month ? Number(month) : undefined);
  }
}
