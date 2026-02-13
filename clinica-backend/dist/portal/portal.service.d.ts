import { PrismaService } from '../prisma/prisma.service';
export declare class PortalService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureClientProfile;
    me(user: {
        clientProfileId?: string | null;
    }): Promise<{
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
    } | null>;
    myAppointments(user: {
        clientProfileId?: string | null;
    }): Promise<({
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
    myReferrals(user: {
        clientProfileId?: string | null;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReferralStatus;
        createdAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
        referrerClientId: string;
        referredName: string;
        referredPhone: string | null;
        referredEmail: string | null;
        convertedClientId: string | null;
    }[]>;
}
