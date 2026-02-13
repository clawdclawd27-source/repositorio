import { PortalService } from './portal.service';
export declare class PortalController {
    private portalService;
    constructor(portalService: PortalService);
    me(req: any): Promise<{
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
    } | null>;
    myAppointments(req: any): Promise<({
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
    myReferrals(req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReferralStatus;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        referrerClientId: string;
        referredName: string;
        referredPhone: string | null;
        referredEmail: string | null;
        convertedClientId: string | null;
    }[]>;
}
