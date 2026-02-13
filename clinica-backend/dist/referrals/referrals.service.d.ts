import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto, UpdateReferralStatusDto } from './dto';
export declare class ReferralsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
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
    create(dto: CreateReferralDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
    updateStatus(id: string, dto: UpdateReferralStatusDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
