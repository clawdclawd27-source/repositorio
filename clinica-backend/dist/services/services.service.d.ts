import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
export declare class ServicesService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }[]>;
    create(dto: CreateServiceDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }>;
    update(id: string, dto: UpdateServiceDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }>;
}
