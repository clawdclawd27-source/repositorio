import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from './dto';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('entries')
  @Permission('finance', 'view')
  list() {
    return this.financeService.list();
  }

  @Get('summary')
  @Permission('finance', 'view')
  summary() {
    return this.financeService.summary();
  }

  @Post('entries')
  @Permission('finance', 'create')
  create(@Body() dto: CreateFinancialEntryDto, @Req() req: any) {
    return this.financeService.create(dto, req.user);
  }

  @Patch('entries/:id')
  @Permission('finance', 'edit')
  update(@Param('id') id: string, @Body() dto: UpdateFinancialEntryDto, @Req() req: any) {
    return this.financeService.update(id, dto, req.user);
  }
}
