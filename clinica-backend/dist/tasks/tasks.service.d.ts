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
            phone: string | null;
            createdAt: Date;
            notes: string | null;
            createdById: string | null;
            updatedAt: Date;
            fullName: string;
            cpf: string | null;
            birthDate: Date | null;
            email: string | null;
            emergencyContact: string | null;
            allergies: string | null;
            contraindications: string | null;
        } | null;
        assignedTo: {
            id: string;
            phone: string | null;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            email: string;
            clientProfileId: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
    })[]>;
    create(dto: CreateTaskDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
    }>;
    update(id: string, dto: UpdateTaskDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        createdAt: Date;
        clientId: string | null;
        createdById: string | null;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
    }>;
}
