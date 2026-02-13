import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
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
  create(@Body() dto: CreateClientDto, @Req() req: any) {
    return this.clientsService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  update(@Param('id') id: string, @Body() dto: UpdateClientDto, @Req() req: any) {
    return this.clientsService.update(id, dto, req.user);
  }
}
