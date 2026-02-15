import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async create(dto: CreateClientDto, actor: { id: string; role: UserRole }) {
    const role = dto.accountRole || UserRole.CLIENT;

    if ((dto.loginEmail && !dto.loginPassword) || (!dto.loginEmail && dto.loginPassword)) {
      throw new BadRequestException('Informe login e senha juntos para criar acesso.');
    }

    if (dto.loginEmail) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.loginEmail } });
      if (existing) throw new BadRequestException('Login (e-mail) já cadastrado.');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          fullName: dto.fullName,
          cpf: dto.cpf,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          email: dto.email,
          phone: dto.phone,
          emergencyContact: dto.emergencyContact,
          allergies: dto.allergies,
          contraindications: dto.contraindications,
          notes: dto.notes,
          createdById: actor.id,
        },
      });

      if (dto.loginEmail && dto.loginPassword) {
        const passwordHash = await bcrypt.hash(dto.loginPassword, 10);
        await tx.user.create({
          data: {
            name: dto.fullName,
            email: dto.loginEmail,
            phone: dto.phone,
            passwordHash,
            role,
            ...(role === UserRole.CLIENT ? { clientProfileId: client.id } : {}),
          },
        });
      }

      return client;
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_CLIENT',
      entityType: 'CLIENT',
      entityId: created.id,
      sourcePlatform: 'API',
      details: { fullName: created.fullName, accountRole: role, hasLogin: Boolean(dto.loginEmail) },
    });

    return created;
  }

  async update(id: string, dto: UpdateClientDto, actor: { id: string; role: UserRole }) {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        cpf: dto.cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        email: dto.email,
        phone: dto.phone,
        emergencyContact: dto.emergencyContact,
        allergies: dto.allergies,
        contraindications: dto.contraindications,
        notes: dto.notes,
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

  async remove(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');

    const [appointments, packages, tasks, finance, referrals] = await this.prisma.$transaction([
      this.prisma.appointment.count({ where: { clientId: id } }),
      this.prisma.clientPackage.count({ where: { clientId: id } }),
      this.prisma.task.count({ where: { clientId: id } }),
      this.prisma.financialEntry.count({ where: { clientId: id } }),
      this.prisma.referral.count({ where: { referrerClientId: id } }),
    ]);

    const linked = appointments + packages + tasks + finance + referrals;
    if (linked > 0) {
      throw new BadRequestException('Cliente possui histórico vinculado e não pode ser apagado.');
    }

    await this.prisma.client.delete({ where: { id } });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'DELETE_CLIENT',
      entityType: 'CLIENT',
      entityId: id,
      sourcePlatform: 'API',
    });

    return { ok: true };
  }
}
