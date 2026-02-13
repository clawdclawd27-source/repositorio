import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { DateRangeDto } from './dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('financial')
  @Permission('reports', 'view')
  financial(@Query() q: DateRangeDto) {
    return this.reportsService.financial(q.from, q.to);
  }

  @Get('appointments')
  @Permission('reports', 'view')
  appointments(@Query() q: DateRangeDto) {
    return this.reportsService.appointments(q.from, q.to);
  }

  @Get('referrals')
  @Permission('reports', 'view')
  referrals(@Query() q: DateRangeDto) {
    return this.reportsService.referrals(q.from, q.to);
  }

  @Get('inventory')
  @Permission('reports', 'view')
  inventory() {
    return this.reportsService.inventory();
  }
}
