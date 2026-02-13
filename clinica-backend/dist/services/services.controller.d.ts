import { CreateServiceDto, UpdateServiceDto } from './dto';
import { ServicesService } from './services.service';
export declare class ServicesController {
    private servicesService;
    constructor(servicesService: ServicesService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        active: boolean;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    create(dto: CreateServiceDto, req: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        active: boolean;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdateServiceDto, req: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        active: boolean;
        durationMinutes: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
}
