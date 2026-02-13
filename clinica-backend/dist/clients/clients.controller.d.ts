import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientsService } from './clients.service';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }[]>;
    get(id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        phone: string | null;
        createdAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(dto: CreateClientDto, req: any): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }>;
    update(id: string, dto: UpdateClientDto, req: any): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        notes: string | null;
        createdById: string | null;
        updatedAt: Date;
        fullName: string;
        cpf: string | null;
        birthDate: Date | null;
        email: string | null;
        emergencyContact: string | null;
        allergies: string | null;
        contraindications: string | null;
    }>;
}
