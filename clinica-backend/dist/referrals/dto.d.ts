import { ReferralStatus } from '@prisma/client';
export declare class CreateReferralDto {
    referrerClientId: string;
    referredName: string;
    referredPhone?: string;
    referredEmail?: string;
    notes?: string;
}
export declare class UpdateReferralStatusDto {
    status: ReferralStatus;
    convertedClientId?: string;
    notes?: string;
}
