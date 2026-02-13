import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReferralDto, UpdateReferralStatusDto } from './dto';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  list() {
    return this.referralsService.list();
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.CLIENT)
  create(@Body() dto: CreateReferralDto, @Req() req: any) {
    return this.referralsService.create(dto, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.OWNER)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReferralStatusDto, @Req() req: any) {
    return this.referralsService.updateStatus(id, dto, req.user);
  }
}
