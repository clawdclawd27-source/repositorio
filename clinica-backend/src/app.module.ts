import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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
import { TasksModule } from './tasks/tasks.module';
import { BirthdaysModule } from './birthdays/birthdays.module';
import { FinanceModule } from './finance/finance.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    TasksModule,
    BirthdaysModule,
    FinanceModule,
    InventoryModule,
    NotificationsModule,
  ],
})
export class AppModule {}
