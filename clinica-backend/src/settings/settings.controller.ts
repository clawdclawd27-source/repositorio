import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProfessionalDto, UpdateAdminPasswordDto, UpdateAgendaSettingsDto, UpdateClinicProfileDto, UpdateNotificationSettingsDto, UpdateProfessionalDto } from './dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('clinic-profile')
  @Permission('settings', 'view')
  getClinicProfile() {
    return this.settingsService.getClinicProfile();
  }

  @Put('clinic-profile')
  @Permission('settings', 'edit')
  updateClinicProfile(@Body() dto: UpdateClinicProfileDto) {
    return this.settingsService.updateClinicProfile(dto);
  }

  @Get('agenda')
  @Permission('settings', 'view')
  getAgenda() {
    return this.settingsService.getAgendaSettings();
  }

  @Put('agenda')
  @Permission('settings', 'edit')
  updateAgenda(@Body() dto: UpdateAgendaSettingsDto) {
    return this.settingsService.updateAgendaSettings(dto);
  }

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

  @Patch('account/password')
  @Permission('settings', 'edit')
  updateAdminPassword(@Req() req: any, @Body() dto: UpdateAdminPasswordDto) {
    return this.settingsService.updateAdminPassword(req.user, dto);
  }

  @Get('professionals')
  @Permission('settings', 'view')
  listProfessionals() {
    return this.settingsService.listProfessionals();
  }

  @Post('professionals')
  @Permission('settings', 'edit')
  createProfessional(@Body() dto: CreateProfessionalDto, @Req() req: any) {
    return this.settingsService.createProfessional(dto, req.user);
  }

  @Patch('professionals/:id')
  @Permission('settings', 'edit')
  updateProfessional(@Param('id') id: string, @Body() dto: UpdateProfessionalDto, @Req() req: any) {
    return this.settingsService.updateProfessional(id, dto, req.user);
  }

  @Delete('professionals/:id')
  @Permission('settings', 'edit')
  deleteProfessional(@Param('id') id: string, @Req() req: any) {
    return this.settingsService.deleteProfessional(id, req.user);
  }
}
