import { BirthdaysService } from './birthdays.service';
export declare class BirthdaysController {
    private birthdaysService;
    constructor(birthdaysService: BirthdaysService);
    list(month?: string): Promise<{
        birthMonth: number;
        birthDay: number;
        id: string;
        phone: string | null;
        fullName: string;
        birthDate: Date | null;
        email: string | null;
    }[]>;
}
