import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PortalListAppointmentsQueryDto,
  PortalListReferralsQueryDto,
  UpdatePortalEmailDto,
  UpdatePortalPasswordDto,
  UpdatePortalProfileDto,
} from './dto';
import { PortalService } from './portal.service';

@Controller('portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class PortalController {
  constructor(private portalService: PortalService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.portalService.me(req.user);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdatePortalProfileDto) {
    return this.portalService.updateMe(req.user, dto);
  }

  @Patch('account/email')
  updateEmail(@Req() req: any, @Body() dto: UpdatePortalEmailDto) {
    return this.portalService.updateEmail(req.user, dto);
  }

  @Patch('account/password')
  updatePassword(@Req() req: any, @Body() dto: UpdatePortalPasswordDto) {
    return this.portalService.updatePassword(req.user, dto);
  }

  @Get('appointments')
  myAppointments(@Req() req: any, @Query() query: PortalListAppointmentsQueryDto) {
    return this.portalService.myAppointments(req.user, query);
  }

  @Get('services')
  services() {
    return this.portalService.services();
  }

  @Get('referrals')
  myReferrals(@Req() req: any, @Query() query: PortalListReferralsQueryDto) {
    return this.portalService.myReferrals(req.user, query);
  }
}
