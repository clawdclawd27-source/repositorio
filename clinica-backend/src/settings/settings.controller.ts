import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateNotificationSettingsDto } from './dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('notifications')
  @Permission('settings', 'view')
  getNotifications() {
    return this.settingsService.getNotificationSettings();
  }

  @Put('notifications')
  @Permission('settings', 'edit')
  updateNotifications(@Body() dto: UpdateNotificationSettingsDto) {
    return this.settingsService.updateNotificationSettings(dto);
  }
}
