import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
export declare class TasksService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            cpf: string | null;
            birthDate: Date | null;
            email: string | null;
            phone: string | null;
            emergencyContact: string | null;
            allergies: string | null;
            contraindications: string | null;
            notes: string | null;
        } | null;
        assignedTo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
            phone: string | null;
            clientProfileId: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        dueDate: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignedToId: string | null;
    })[]>;
    create(dto: CreateTaskDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        dueDate: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignedToId: string | null;
    }>;
    update(id: string, dto: UpdateTaskDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        dueDate: Date | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignedToId: string | null;
    }>;
}
