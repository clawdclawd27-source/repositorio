import { AppointmentStatus } from '@prisma/client';
export declare class CreateAppointmentDto {
    clientId: string;
    serviceId: string;
    professionalId?: string;
    startsAt: string;
    endsAt: string;
    notes?: string;
}
export declare class UpdateAppointmentStatusDto {
    status: AppointmentStatus;
    notes?: string;
}
