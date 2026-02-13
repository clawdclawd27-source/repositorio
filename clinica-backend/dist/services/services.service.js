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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list() {
        return this.prisma.service.findMany({ orderBy: { name: 'asc' } });
    }
    async create(dto, actor) {
        const created = await this.prisma.service.create({ data: { ...dto } });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'CREATE_SERVICE',
            entityType: 'SERVICE',
            entityId: created.id,
            sourcePlatform: 'API',
        });
        return created;
    }
    async update(id, dto, actor) {
        const updated = await this.prisma.service.update({ where: { id }, data: { ...dto } });
        await this.audit.log({
            actorUserId: actor.id,
            actorRole: actor.role,
            action: 'UPDATE_SERVICE',
            entityType: 'SERVICE',
            entityId: updated.id,
            sourcePlatform: 'API',
        });
        return updated;
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ServicesService);
//# sourceMappingURL=services.service.js.map