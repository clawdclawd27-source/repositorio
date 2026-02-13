import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  list() {
    return this.prisma.task.findMany({
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: { assignedTo: true, client: true },
    });
  }

  async create(dto: CreateTaskDto, actor: { id: string; role: UserRole }) {
    const created = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assignedToId: dto.assignedToId,
        clientId: dto.clientId,
        createdById: actor.id,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: created.id,
      sourcePlatform: 'API',
    });

    return created;
  }

  async update(id: string, dto: UpdateTaskDto, actor: { id: string; role: UserRole }) {
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'UPDATE_TASK',
      entityType: 'TASK',
      entityId: updated.id,
      sourcePlatform: 'API',
      details: { status: updated.status, priority: updated.priority },
    });

    return updated;
  }
}
