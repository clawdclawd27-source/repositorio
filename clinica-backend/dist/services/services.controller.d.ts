import { CreateServiceDto, UpdateServiceDto } from './dto';
import { ServicesService } from './services.service';
export declare class ServicesController {
    private servicesService;
    constructor(servicesService: ServicesService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }[]>;
    create(dto: CreateServiceDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }>;
    update(id: string, dto: UpdateServiceDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }>;
}
