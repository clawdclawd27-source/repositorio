"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const permission_decorator_1 = require("../common/decorators/permission.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permission_guard_1 = require("../common/guards/permission.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const dto_1 = require("./dto");
const notifications_service_1 = require("./notifications.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    sendTest(dto) {
        return this.notificationsService.sendTest(dto.phone, dto.message);
    }
    runAppointmentsNow() {
        return this.notificationsService.runAppointmentsReminder();
    }
    runBirthdaysNow() {
        return this.notificationsService.runBirthdayReminder();
    }
    logs() {
        return this.notificationsService.logs();
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('test-whatsapp'),
    (0, permission_decorator_1.Permission)('notifications', 'create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendTestMessageDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "sendTest", null);
__decorate([
    (0, common_1.Post)('run-appointments'),
    (0, permission_decorator_1.Permission)('notifications', 'create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "runAppointmentsNow", null);
__decorate([
    (0, common_1.Post)('run-birthdays'),
    (0, permission_decorator_1.Permission)('notifications', 'create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "runBirthdaysNow", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, permission_decorator_1.Permission)('notifications', 'view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "logs", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permission_guard_1.PermissionGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.OWNER),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map