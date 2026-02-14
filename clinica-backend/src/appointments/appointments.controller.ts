import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import {
  AvailabilityQueryDto,
  CalendarViewQueryDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  RescheduleAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('calendar-view')
  @Permission('appointments', 'view')
  calendarView(@Query() query: CalendarViewQueryDto) {
    return this.appointmentsService.calendarView(query);
  }

  @Get('availability')
  @Permission('appointments', 'view')
  availability(@Query() query: AvailabilityQueryDto) {
    return this.appointmentsService.availability(query);
  }

  @Get()
  @Permission('appointments', 'view')
  list(@Query() query: ListAppointmentsQueryDto) {
    return this.appointmentsService.list(query);
  }

  @Post('check-and-create')
  @Permission('appointments', 'create')
  checkAndCreate(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.checkAndCreate(dto, req.user);
  }

  @Post()
  @Permission('appointments', 'create')
  create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(dto, req.user);
  }

  @Patch(':id/reschedule')
  @Permission('appointments', 'edit')
  reschedule(@Param('id') id: string, @Body() dto: RescheduleAppointmentDto, @Req() req: any) {
    return this.appointmentsService.reschedule(id, dto, req.user);
  }

  @Patch(':id/status')
  @Permission('appointments', 'edit')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto, @Req() req: any) {
    return this.appointmentsService.updateStatus(id, dto, req.user);
  }

  @Delete(':id')
  @Permission('appointments', 'edit')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.remove(id, req.user);
  }
}
