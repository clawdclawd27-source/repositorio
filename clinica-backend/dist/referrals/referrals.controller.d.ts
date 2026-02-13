import { CreateReferralDto, UpdateReferralStatusDto } from './dto';
import { ReferralsService } from './referrals.service';
export declare class ReferralsController {
    private referralsService;
    constructor(referralsService: ReferralsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        referrerClient: {
            id: string;
            notes: string | null;
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
        };
    } & {
        id: string;
        referrerClientId: string;
        referredName: string;
        referredPhone: string | null;
        referredEmail: string | null;
        status: import(".prisma/client").$Enums.ReferralStatus;
        convertedClientId: string | null;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(dto: CreateReferralDto, req: any): Promise<{
        id: string;
        referrerClientId: string;
        referredName: string;
        referredPhone: string | null;
        referredEmail: string | null;
        status: import(".prisma/client").$Enums.ReferralStatus;
        convertedClientId: string | null;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateReferralStatusDto, req: any): Promise<{
        id: string;
        referrerClientId: string;
        referredName: string;
        referredPhone: string | null;
        referredEmail: string | null;
        status: import(".prisma/client").$Enums.ReferralStatus;
        convertedClientId: string | null;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
