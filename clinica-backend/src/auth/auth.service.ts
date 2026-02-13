import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const user = await this.usersService.createUser(dto);
    return this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
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
    });
  }

  private async signToken(payload: { sub: string; email: string; role: string; name: string }) {
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user: payload };
  }
}
