import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientsService } from './clients.service';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    get(id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(dto: CreateClientDto, req: any): Promise<{
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
    }>;
    update(id: string, dto: UpdateClientDto, req: any): Promise<{
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
    }>;
}
