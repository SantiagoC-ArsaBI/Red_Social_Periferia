import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { UserPayloadDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida credenciales contra la base de datos (email + password hasheado).
   */
  async validateUser(usuario: string, clave: string): Promise<UserPayloadDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: usuario },
    });
    if (!user || !(await bcrypt.compare(clave, user.password))) {
      return null;
    }
    return this.toUserPayload(user);
  }

  /**
   * Login: valida credenciales y devuelve JWT + datos de usuario.
   */
  async login(usuario: string, clave: string): Promise<{ access_token: string; user: UserPayloadDto }> {
    const user = await this.validateUser(usuario, clave);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const access_token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    );
    return { access_token, user };
  }

  private toUserPayload(user: { id: number; email: string; firstName: string; lastName: string; birthDate: Date; alias: string }): UserPayloadDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate.toISOString().slice(0, 10),
      alias: user.alias,
    };
  }
}
