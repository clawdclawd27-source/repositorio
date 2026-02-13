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
    } & {
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
    })[]>;
    create(dto: CreateReferralDto, actor: {
        id: string;
        role: UserRole;
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
    }>;
    updateStatus(id: string, dto: UpdateReferralStatusDto, actor: {
        id: string;
        role: UserRole;
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
    }>;
}
