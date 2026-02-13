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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("./whatsapp.service");
let NotificationsService = class NotificationsService {
    constructor(prisma, whatsapp) {
        this.prisma = prisma;
        this.whatsapp = whatsapp;
    }
    normalizePhone(phone) {
        if (!phone)
            return null;
        return phone.replace(/\D/g, '');
    }
    async logMessage(input) {
        return this.prisma.outboundMessage.create({
            data: {
                uniqueKey: input.uniqueKey,
                kind: input.kind,
                phone: input.phone,
                status: input.status,
                payload: input.payload ?? undefined,
                response: input.response ?? undefined,
                error: input.error,
            },
        });
    }
    async sendTest(phone, message) {
        const to = this.normalizePhone(phone);
        if (!to)
            throw new Error('Telefone inválido');
        try {
            const sent = await this.whatsapp.sendText(to, message);
            await this.logMessage({ kind: 'TEST', phone: to, status: 'SENT', payload: sent.payload, response: sent.data });
            return { ok: true };
        }
        catch (e) {
            await this.logMessage({ kind: 'TEST', phone: to, status: 'ERROR', error: e?.message || 'erro' });
            throw e;
        }
    }
    async runAppointmentsReminder() {
        const now = new Date();
        const stages = [
            { label: '24H', minutes: 24 * 60, tol: 10 },
            { label: '2H', minutes: 2 * 60, tol: 10 },
        ];
        for (const stage of stages) {
            const start = new Date(now.getTime() + (stage.minutes - stage.tol) * 60000);
            const end = new Date(now.getTime() + (stage.minutes + stage.tol) * 60000);
            const appts = await this.prisma.appointment.findMany({
                where: { startsAt: { gte: start, lte: end }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
                include: { client: true, service: true },
            });
            for (const appt of appts) {
                const to = this.normalizePhone(appt.client.phone);
                if (!to)
                    continue;
                const uniqueKey = `APPT_${stage.label}_${appt.id}`;
                const already = await this.prisma.outboundMessage.findUnique({ where: { uniqueKey } });
                if (already)
                    continue;
                const when = appt.startsAt.toLocaleString('pt-BR');
                const text = `Olá ${appt.client.fullName}, lembrando sua consulta de ${appt.service.name} em ${when}.`;
                try {
                    const sent = await this.whatsapp.sendText(to, text);
                    await this.logMessage({
                        uniqueKey,
                        kind: `APPOINTMENT_${stage.label}`,
                        phone: to,
                        status: 'SENT',
                        payload: sent.payload,
                        response: sent.data,
                    });
                }
                catch (e) {
                    await this.logMessage({ uniqueKey, kind: `APPOINTMENT_${stage.label}`, phone: to, status: 'ERROR', error: e?.message || 'erro' });
                }
            }
        }
    }
    async runBirthdayReminder() {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const clients = await this.prisma.client.findMany({ where: { birthDate: { not: null } } });
        for (const c of clients) {
            if (!c.birthDate)
                continue;
            const d = new Date(c.birthDate);
            if (d.getDate() !== day || d.getMonth() + 1 !== month)
                continue;
            const to = this.normalizePhone(c.phone);
            if (!to)
                continue;
            const uniqueKey = `BDAY_${c.id}_${now.toISOString().slice(0, 10)}`;
            const already = await this.prisma.outboundMessage.findUnique({ where: { uniqueKey } });
            if (already)
                continue;
            const text = `Feliz aniversário, ${c.fullName}! 🎉 A equipe da clínica deseja um dia incrível para você.`;
            try {
                const sent = await this.whatsapp.sendText(to, text);
                await this.logMessage({ uniqueKey, kind: 'BIRTHDAY', phone: to, status: 'SENT', payload: sent.payload, response: sent.data });
            }
            catch (e) {
                await this.logMessage({ uniqueKey, kind: 'BIRTHDAY', phone: to, status: 'ERROR', error: e?.message || 'erro' });
            }
        }
    }
    logs() {
        return this.prisma.outboundMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)('*/10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "runAppointmentsReminder", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "runBirthdayReminder", null);
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map