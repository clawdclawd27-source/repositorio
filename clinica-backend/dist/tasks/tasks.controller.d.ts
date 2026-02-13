import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        assignedTo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
            phone: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            clientProfileId: string | null;
        } | null;
        client: {
            id: string;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            fullName: string;
            cpf: string | null;
            birthDate: Date | null;
            emergencyContact: string | null;
            allergies: string | null;
            contraindications: string | null;
            notes: string | null;
        } | null;
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(dto: CreateTaskDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateTaskDto, req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
        assignedToId: string | null;
        clientId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
