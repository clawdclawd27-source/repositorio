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
    create(dto: CreateReferralDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
    updateStatus(id: string, dto: UpdateReferralStatusDto, actor: {
        id: string;
        role: UserRole;
    }): Promise<{
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
