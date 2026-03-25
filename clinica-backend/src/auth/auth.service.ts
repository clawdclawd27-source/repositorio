import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    void dto;
    throw new ForbiddenException('Cadastro público desativado. Solicite criação de conta pela clínica.');
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    return this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      clientProfileId: (user as any).clientProfileId ?? null,
    });
  }

  private async signToken(payload: { sub: string; email: string; role: string; name: string; clientProfileId?: string | null }) {
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user: payload };
  }
}
