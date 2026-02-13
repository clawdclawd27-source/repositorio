export declare class CreateClientDto {
    fullName: string;
    cpf?: string;
    birthDate?: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    allergies?: string;
    contraindications?: string;
    notes?: string;
}
export declare class UpdateClientDto extends CreateClientDto {
}
