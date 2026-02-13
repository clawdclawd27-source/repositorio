import { CreateReferralDto, UpdateReferralStatusDto } from './dto';
import { ReferralsService } from './referrals.service';
export declare class ReferralsController {
    private referralsService;
    constructor(referralsService: ReferralsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        referrerClient: {
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
    } & {
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
    })[]>;
    create(dto: CreateReferralDto, req: any): Promise<{
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
    }>;
    updateStatus(id: string, dto: UpdateReferralStatusDto, req: any): Promise<{
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
    }>;
}
