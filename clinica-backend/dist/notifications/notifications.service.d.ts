import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
export declare class NotificationsService {
    private prisma;
    private whatsapp;
    constructor(prisma: PrismaService, whatsapp: WhatsAppService);
    private normalizePhone;
    private logMessage;
    sendTest(phone: string, message: string): Promise<{
        ok: boolean;
    }>;
    runAppointmentsReminder(): Promise<void>;
    runBirthdayReminder(): Promise<void>;
    logs(): import(".prisma/client").Prisma.PrismaPromise<{
        error: string | null;
        id: string;
        uniqueKey: string | null;
        kind: string;
        phone: string;
        status: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        response: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
}
