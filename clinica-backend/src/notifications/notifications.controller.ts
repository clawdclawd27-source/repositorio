import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SendTestMessageDto } from './dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('test-whatsapp')
  @Permission('notifications', 'create')
  sendTest(@Body() dto: SendTestMessageDto) {
    return this.notificationsService.sendTest(dto.phone, dto.message);
  }

  @Post('run-appointments')
  @Permission('notifications', 'create')
  runAppointmentsNow() {
    return this.notificationsService.runAppointmentsReminder();
  }

  @Post('run-birthdays')
  @Permission('notifications', 'create')
  runBirthdaysNow() {
    return this.notificationsService.runBirthdayReminder();
  }

  @Get('logs')
  @Permission('notifications', 'view')
  logs() {
    return this.notificationsService.logs();
  }

  @Delete('logs')
  @Permission('notifications', 'edit')
  clearLogs() {
    return this.notificationsService.clearLogs();
  }
}
