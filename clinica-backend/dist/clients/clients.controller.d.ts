import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        phone: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }[]>;
    get(id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        phone: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(dto: CreateClientDto, req: any): Promise<{
        id: string;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        phone: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }>;
    update(id: string, dto: UpdateClientDto, req: any): Promise<{
        id: string;
        notes: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        phone: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }>;
}
