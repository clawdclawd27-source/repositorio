import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  CreateTreatmentPackageDto,
  ListPackageConsumptionsQueryDto,
  ListPackagesQueryDto,
  SellPackageDto,
  UpdateSoldClientPackageDto,
  UpdateTreatmentPackageDto,
} from './dto';
import { PackagesService } from './packages.service';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @Permission('finance', 'view')
  list(@Query() query: ListPackagesQueryDto) {
    return this.packagesService.list(query);
  }

  @Post()
  @Permission('finance', 'create')
  create(@Body() dto: CreateTreatmentPackageDto, @Req() req: any) {
    return this.packagesService.create(dto, req.user);
  }

  @Patch(':id')
  @Permission('finance', 'edit')
  update(@Param('id') id: string, @Body() dto: UpdateTreatmentPackageDto, @Req() req: any) {
    return this.packagesService.update(id, dto, req.user);
  }

  @Post(':id/sell')
  @Permission('finance', 'create')
  sell(@Param('id') id: string, @Body() dto: SellPackageDto, @Req() req: any) {
    return this.packagesService.sell(id, dto, req.user);
  }

  @Delete(':id')
  @Permission('finance', 'edit')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.packagesService.remove(id, req.user);
  }

  @Patch('client-package/:clientPackageId')
  @Permission('finance', 'edit')
  updateSoldClientPackage(
    @Param('clientPackageId') clientPackageId: string,
    @Body() dto: UpdateSoldClientPackageDto,
    @Req() req: any,
  ) {
    return this.packagesService.updateSoldClientPackage(clientPackageId, dto, req.user);
  }

  @Delete('client-package/:clientPackageId')
  @Permission('finance', 'edit')
  removeSoldClientPackage(@Param('clientPackageId') clientPackageId: string, @Req() req: any) {
    return this.packagesService.removeSoldClientPackage(clientPackageId, req.user);
  }

  @Get('client/:clientId/balances')
  @Permission('finance', 'view')
  clientBalances(@Param('clientId') clientId: string) {
    return this.packagesService.clientBalances(clientId);
  }

  @Get('client-package/:clientPackageId/consumptions')
  @Permission('finance', 'view')
  packageConsumptionHistory(
    @Param('clientPackageId') clientPackageId: string,
    @Query() query: ListPackageConsumptionsQueryDto,
  ) {
    return this.packagesService.packageConsumptionHistory(clientPackageId, query);
  }

  @Get('client/:clientId/consumptions')
  @Permission('finance', 'view')
  clientConsumptionHistory(@Param('clientId') clientId: string, @Query() query: ListPackageConsumptionsQueryDto) {
    return this.packagesService.clientConsumptionHistory(clientId, query);
  }
}
