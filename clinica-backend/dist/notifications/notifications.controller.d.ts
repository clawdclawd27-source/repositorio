import { SendTestMessageDto } from './dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    sendTest(dto: SendTestMessageDto): Promise<{
        ok: boolean;
    }>;
    runAppointmentsNow(): Promise<void>;
    runBirthdaysNow(): Promise<void>;
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
