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
        };
        service: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            durationMinutes: number;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            active: boolean;
        };
        professional: {
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        clientId: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
    })[]>;
    create(dto: CreateAppointmentDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        clientId: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateAppointmentStatusDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        clientId: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        serviceId: string;
        professionalId: string | null;
        startsAt: Date;
        endsAt: Date;
    }>;
}
