import { TaskPriority, TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assignedToId?: string;
    clientId?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    assignedToId?: string;
}
