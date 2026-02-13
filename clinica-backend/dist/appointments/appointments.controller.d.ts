import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
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
    create(dto: CreateAppointmentDto, req: any): Promise<{
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
    updateStatus(id: string, dto: UpdateAppointmentStatusDto, req: any): Promise<{
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
