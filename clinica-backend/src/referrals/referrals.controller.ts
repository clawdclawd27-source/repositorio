import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReferralDto, ListReferralsQueryDto, UpdateReferralStatusDto } from './dto';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  @Permission('referrals', 'view')
  list(@Query() query: ListReferralsQueryDto) {
    return this.referralsService.list(query);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.CLIENT)
  @Permission('referrals', 'create')
  create(@Body() dto: CreateReferralDto, @Req() req: any) {
    return this.referralsService.create(dto, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.OWNER)
  @Permission('referrals', 'edit')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReferralStatusDto, @Req() req: any) {
    return this.referralsService.updateStatus(id, dto, req.user);
  }
}
