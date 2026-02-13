import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ReferralsModule } from './referrals/referrals.module';
import { AuditModule } from './audit/audit.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PortalModule } from './portal/portal.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ReferralsModule,
    AuditModule,
    ServicesModule,
    AppointmentsModule,
    PortalModule,
    PermissionsModule,
  ],
})
export class AppModule {}
