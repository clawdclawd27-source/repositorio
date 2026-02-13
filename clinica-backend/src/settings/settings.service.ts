import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationSettingsDto } from './dto';

const KEY = 'notifications.config';

const DEFAULTS = {
  appointmentEnabled: true,
  birthdayEnabled: true,
  startHour: 8,
  endHour: 20,
  appointmentTemplate:
    'Olá {{clientName}}, lembrando sua consulta de {{serviceName}} em {{dateTime}}.',
  birthdayTemplate:
    'Feliz aniversário, {{clientName}}! 🎉 A equipe da clínica deseja um dia incrível para você.',
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getNotificationSettings() {
    const row = await this.prisma.appSetting.findUnique({ where: { key: KEY } });
    return { ...DEFAULTS, ...(row?.value as object || {}) };
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto) {
    const current = await this.getNotificationSettings();
    const next = { ...current, ...dto };
    await this.prisma.appSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: next as any },
      update: { value: next as any },
    });
    return next;
  }
}
