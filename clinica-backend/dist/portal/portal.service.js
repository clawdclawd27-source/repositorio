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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PortalService = class PortalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureClientProfile(user) {
        if (!user.clientProfileId)
            throw new common_1.ForbiddenException('Usuário cliente sem vínculo de perfil');
        return user.clientProfileId;
    }
    async me(user) {
        const clientId = this.ensureClientProfile(user);
        return this.prisma.client.findUnique({ where: { id: clientId } });
    }
    async myAppointments(user) {
        const clientId = this.ensureClientProfile(user);
        return this.prisma.appointment.findMany({
            where: { clientId },
            orderBy: { startsAt: 'asc' },
            include: { service: true },
        });
    }
    async myReferrals(user) {
        const clientId = this.ensureClientProfile(user);
        return this.prisma.referral.findMany({
            where: { referrerClientId: clientId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortalService);
//# sourceMappingURL=portal.service.js.map