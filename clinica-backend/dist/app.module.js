"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const referrals_module_1 = require("./referrals/referrals.module");
const audit_module_1 = require("./audit/audit.module");
const services_module_1 = require("./services/services.module");
const appointments_module_1 = require("./appointments/appointments.module");
const portal_module_1 = require("./portal/portal.module");
const permissions_module_1 = require("./permissions/permissions.module");
const tasks_module_1 = require("./tasks/tasks.module");
const birthdays_module_1 = require("./birthdays/birthdays.module");
const finance_module_1 = require("./finance/finance.module");
const inventory_module_1 = require("./inventory/inventory.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            referrals_module_1.ReferralsModule,
            audit_module_1.AuditModule,
            services_module_1.ServicesModule,
            appointments_module_1.AppointmentsModule,
            portal_module_1.PortalModule,
            permissions_module_1.PermissionsModule,
            tasks_module_1.TasksModule,
            birthdays_module_1.BirthdaysModule,
            finance_module_1.FinanceModule,
            inventory_module_1.InventoryModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map