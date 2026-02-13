import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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

  @Get('appointments')
  myAppointments(@Req() req: any) {
    return this.portalService.myAppointments(req.user);
  }

  @Get('referrals')
  myReferrals(@Req() req: any) {
    return this.portalService.myReferrals(req.user);
  }
}
