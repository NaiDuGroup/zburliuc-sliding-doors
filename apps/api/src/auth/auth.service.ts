import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto, LoginDto } from './auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: admin.id, email: admin.email };
    return {
      accessToken: this.jwtService.sign(payload),
      adminName: admin.name,
    };
  }

  async seedAdmin(email: string, password: string, name: string): Promise<void> {
    const existing = await this.prisma.admin.findUnique({ where: { email } });
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.admin.create({ data: { email, passwordHash, name } });
  }
}
