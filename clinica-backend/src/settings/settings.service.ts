import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgendaSettingsDto, UpdateClinicProfileDto, UpdateNotificationSettingsDto } from './dto';

const KEY = 'notifications.config';
const CLINIC_PROFILE_KEY = 'clinic.profile';
const AGENDA_KEY = 'agenda.settings';

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

const CLINIC_PROFILE_DEFAULTS = {
  clinicName: 'Clínica Emanuelle Ferreira',
  cnpj: '',
  address: '',
  whatsapp: '',
  email: '',
  logoUrl: '',
};

const AGENDA_DEFAULTS = {
  workStartHour: 8,
  workEndHour: 18,
  slotMinutes: 30,
  bufferMinutes: 10,
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

  async getClinicProfile() {
    const row = await this.prisma.appSetting.findUnique({ where: { key: CLINIC_PROFILE_KEY } });
    return { ...CLINIC_PROFILE_DEFAULTS, ...(row?.value as object || {}) };
  }

  async updateClinicProfile(dto: UpdateClinicProfileDto) {
    const current = await this.getClinicProfile();
    const next = { ...current, ...dto };
    await this.prisma.appSetting.upsert({
      where: { key: CLINIC_PROFILE_KEY },
      create: { key: CLINIC_PROFILE_KEY, value: next as any },
      update: { value: next as any },
    });
    return next;
  }

  async getAgendaSettings() {
    const row = await this.prisma.appSetting.findUnique({ where: { key: AGENDA_KEY } });
    return { ...AGENDA_DEFAULTS, ...(row?.value as object || {}) };
  }

  async updateAgendaSettings(dto: UpdateAgendaSettingsDto) {
    const current = await this.getAgendaSettings();
    const next = { ...current, ...dto };
    await this.prisma.appSetting.upsert({
      where: { key: AGENDA_KEY },
      create: { key: AGENDA_KEY, value: next as any },
      update: { value: next as any },
    });
    return next;
  }
}
