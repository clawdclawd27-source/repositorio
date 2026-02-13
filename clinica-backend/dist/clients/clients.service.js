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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let ClientsService = class ClientsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    findAll() {
        return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    }
    findOne(id) {
        return this.prisma.client.findUnique({ where: { id } });
    }
    async create(dto, actor) {
        const created = await this.prisma.client.create({
            data: {
                ...dto,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                createdById: actor.id,
            },
        });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'CREATE_CLIENT',
            entityType: 'CLIENT',
            entityId: created.id,
            sourcePlatform: 'API',
            details: { fullName: created.fullName },
        });
        return created;
    }
    async update(id, dto, actor) {
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Cliente não encontrado');
        const updated = await this.prisma.client.update({
            where: { id },
            data: {
                ...dto,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            },
        });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'UPDATE_CLIENT',
            entityType: 'CLIENT',
            entityId: updated.id,
            sourcePlatform: 'API',
        });
        return updated;
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map