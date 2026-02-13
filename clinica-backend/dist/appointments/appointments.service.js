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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AppointmentsService = class AppointmentsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list() {
        return this.prisma.appointment.findMany({
            orderBy: { startsAt: 'asc' },
            include: { client: true, service: true, professional: true },
        });
    }
    async create(dto, actor) {
        const created = await this.prisma.appointment.create({
            data: {
                clientId: dto.clientId,
                serviceId: dto.serviceId,
                professionalId: dto.professionalId,
                startsAt: new Date(dto.startsAt),
                endsAt: new Date(dto.endsAt),
                notes: dto.notes,
                createdById: actor.id,
            },
        });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'CREATE_APPOINTMENT',
            entityType: 'APPOINTMENT',
            entityId: created.id,
            sourcePlatform: 'API',
        });
        return created;
    }
    async updateStatus(id, dto, actor) {
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: dto.status, notes: dto.notes },
        });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'UPDATE_APPOINTMENT_STATUS',
            entityType: 'APPOINTMENT',
            entityId: updated.id,
            sourcePlatform: 'API',
            details: { status: updated.status },
        });
        return updated;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map