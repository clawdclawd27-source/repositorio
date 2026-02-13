import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
  ) {}

  private normalizePhone(phone?: string | null) {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
  }

  private async logMessage(input: {
    uniqueKey?: string;
    kind: string;
    phone: string;
    status: string;
    payload?: unknown;
    response?: unknown;
    error?: string;
  }) {
    return this.prisma.outboundMessage.create({
      data: {
        uniqueKey: input.uniqueKey,
        kind: input.kind,
        phone: input.phone,
        status: input.status,
        payload: (input.payload as any) ?? undefined,
        response: (input.response as any) ?? undefined,
        error: input.error,
      },
    });
  }

  async sendTest(phone: string, message: string) {
    const to = this.normalizePhone(phone);
    if (!to) throw new Error('Telefone inválido');

    try {
      const sent = await this.whatsapp.sendText(to, message);
      await this.logMessage({ kind: 'TEST', phone: to, status: 'SENT', payload: sent.payload, response: sent.data });
      return { ok: true };
    } catch (e: any) {
      await this.logMessage({ kind: 'TEST', phone: to, status: 'ERROR', error: e?.message || 'erro' });
      throw e;
    }
  }

  @Cron('*/10 * * * *')
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
        if (!to) continue;

        const uniqueKey = `APPT_${stage.label}_${appt.id}`;
        const already = await this.prisma.outboundMessage.findUnique({ where: { uniqueKey } });
        if (already) continue;

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
        } catch (e: any) {
          await this.logMessage({ uniqueKey, kind: `APPOINTMENT_${stage.label}`, phone: to, status: 'ERROR', error: e?.message || 'erro' });
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async runBirthdayReminder() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;

    const clients = await this.prisma.client.findMany({ where: { birthDate: { not: null } } });
    for (const c of clients) {
      if (!c.birthDate) continue;
      const d = new Date(c.birthDate);
      if (d.getDate() !== day || d.getMonth() + 1 !== month) continue;

      const to = this.normalizePhone(c.phone);
      if (!to) continue;

      const uniqueKey = `BDAY_${c.id}_${now.toISOString().slice(0, 10)}`;
      const already = await this.prisma.outboundMessage.findUnique({ where: { uniqueKey } });
      if (already) continue;

      const text = `Feliz aniversário, ${c.fullName}! 🎉 A equipe da clínica deseja um dia incrível para você.`;
      try {
        const sent = await this.whatsapp.sendText(to, text);
        await this.logMessage({ uniqueKey, kind: 'BIRTHDAY', phone: to, status: 'SENT', payload: sent.payload, response: sent.data });
      } catch (e: any) {
        await this.logMessage({ uniqueKey, kind: 'BIRTHDAY', phone: to, status: 'ERROR', error: e?.message || 'erro' });
      }
    }
  }

  logs() {
    return this.prisma.outboundMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  }
}
