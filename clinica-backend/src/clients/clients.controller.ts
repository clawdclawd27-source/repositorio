import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  @Permission('clients', 'view')
  list() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OWNER, Role.CLIENT)
  get(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  @Permission('clients', 'create')
  create(@Body() dto: CreateClientDto, @Req() req: any) {
    return this.clientsService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  @Permission('clients', 'edit')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto, @Req() req: any) {
    return this.clientsService.update(id, dto, req.user);
  }
}
