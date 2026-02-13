import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
export declare class AppointmentsService {
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
        };
        service: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            durationMinutes: number;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            active: boolean;
        };
        professional: {
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
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        clientId: string;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
    })[]>;
    create(dto: CreateAppointmentDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        clientId: string;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateAppointmentStatusDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        clientId: string;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
    }>;
}
