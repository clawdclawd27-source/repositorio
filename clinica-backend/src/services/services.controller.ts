import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from './dto';
import { ServicesService } from './services.service';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  @Permission('services', 'view')
  list(@Query() query: ListServicesQueryDto) {
    return this.servicesService.list(query);
  }

  @Post()
  @Permission('services', 'create')
  create(@Body() dto: CreateServiceDto, @Req() req: any) {
    return this.servicesService.create(dto, req.user);
  }

  @Patch(':id')
  @Permission('services', 'edit')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @Req() req: any) {
    return this.servicesService.update(id, dto, req.user);
  }
}
