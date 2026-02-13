import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
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
        };
        service: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            active: boolean;
            durationMinutes: number;
            basePrice: import("@prisma/client/runtime/library").Decimal;
        };
        professional: {
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
    create(dto: CreateAppointmentDto, req: any): Promise<{
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
    updateStatus(id: string, dto: UpdateAppointmentStatusDto, req: any): Promise<{
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
