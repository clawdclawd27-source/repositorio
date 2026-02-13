import { PrismaService } from '../prisma/prisma.service';
export declare class BirthdaysService {
    private prisma;
    constructor(prisma: PrismaService);
    list(month?: number): Promise<{
        birthMonth: number;
        birthDay: number;
        id: string;
        email: string | null;
        phone: string | null;
        fullName: string;
        birthDate: Date | null;
    }[]>;
}
