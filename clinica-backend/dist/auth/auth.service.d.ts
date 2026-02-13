import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            role: string;
            name: string;
            clientProfileId?: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            role: string;
            name: string;
            clientProfileId?: string | null;
        };
    }>;
    private signToken;
}
