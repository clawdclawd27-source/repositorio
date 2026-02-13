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
exports.BirthdaysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BirthdaysService = class BirthdaysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(month) {
        const clients = await this.prisma.client.findMany({
            where: { birthDate: { not: null } },
            select: { id: true, fullName: true, phone: true, email: true, birthDate: true },
            orderBy: { fullName: 'asc' },
        });
        const nowMonth = new Date().getMonth() + 1;
        const targetMonth = month && month >= 1 && month <= 12 ? month : nowMonth;
        return clients
            .map((c) => {
            const d = c.birthDate;
            return { ...c, birthMonth: d.getMonth() + 1, birthDay: d.getDate() };
        })
            .filter((c) => c.birthMonth === targetMonth)
            .sort((a, b) => a.birthDay - b.birthDay);
    }
};
exports.BirthdaysService = BirthdaysService;
exports.BirthdaysService = BirthdaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BirthdaysService);
//# sourceMappingURL=birthdays.service.js.map