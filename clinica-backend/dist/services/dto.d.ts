export declare class CreateServiceDto {
    name: string;
    description?: string;
    durationMinutes: number;
    basePrice: number;
    active?: boolean;
}
export declare class UpdateServiceDto extends CreateServiceDto {
}
