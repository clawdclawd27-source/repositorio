import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateInventoryItemDto, CreateStockMovementDto, UpdateInventoryItemDto } from './dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('items')
  @Permission('inventory', 'view')
  listItems() {
    return this.inventoryService.listItems();
  }

  @Get('low-stock')
  @Permission('inventory', 'view')
  lowStock() {
    return this.inventoryService.lowStock();
  }

  @Post('items')
  @Permission('inventory', 'create')
  createItem(@Body() dto: CreateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.createItem(dto, req.user);
  }

  @Patch('items/:id')
  @Permission('inventory', 'edit')
  updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.updateItem(id, dto, req.user);
  }

  @Get('movements')
  @Permission('inventory', 'view')
  listMovements() {
    return this.inventoryService.listMovements();
  }

  @Post('movements')
  @Permission('inventory', 'create')
  addMovement(@Body() dto: CreateStockMovementDto, @Req() req: any) {
    return this.inventoryService.addMovement(dto, req.user);
  }
}
