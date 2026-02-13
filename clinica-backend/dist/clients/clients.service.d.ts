import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateClientDto, UpdateClientDto } from './dto';
export declare class ClientsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(dto: CreateClientDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
    }>;
    update(id: string, dto: UpdateClientDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
    }>;
}
