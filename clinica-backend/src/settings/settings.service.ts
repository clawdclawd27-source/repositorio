import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto, UpdateAdminPasswordDto, UpdateAgendaSettingsDto, UpdateClinicProfileDto, UpdateNotificationSettingsDto, UpdateProfessionalDto } from './dto';

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

  async updateAdminPassword(user: { sub?: string }, dto: UpdateAdminPasswordDto) {
    if (!user?.sub) throw new ForbiddenException('Usuário inválido');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { passwordHash },
    });
    return { success: true };
  }

  async listProfessionals() {
    return this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.OWNER] }, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  async createProfessional(dto: CreateProfessionalDto, actor: { role?: string }) {
    if (actor?.role !== UserRole.OWNER) {
      throw new ForbiddenException('Somente OWNER pode cadastrar profissional.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const role = dto.role || UserRole.ADMIN;
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  async updateProfessional(id: string, dto: UpdateProfessionalDto, actor: { role?: string }) {
    if (actor?.role !== UserRole.OWNER) {
      throw new ForbiddenException('Somente OWNER pode editar profissional.');
    }

    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current || !current.isActive) throw new BadRequestException('Profissional não encontrado');

    if (dto.email && dto.email !== current.email) {
      const existsEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existsEmail) throw new BadRequestException('E-mail já cadastrado');
    }

    const data: any = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
    };

    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  async deleteProfessional(id: string, actor: { role?: string; sub?: string }) {
    if (actor?.role !== UserRole.OWNER) {
      throw new ForbiddenException('Somente OWNER pode excluir profissional.');
    }

    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current || !current.isActive) throw new BadRequestException('Profissional não encontrado');
    if (current.role === UserRole.OWNER) throw new BadRequestException('Não é permitido excluir OWNER');
    if (actor?.sub && actor.sub === id) throw new BadRequestException('Não é permitido excluir sua própria conta');

    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}
