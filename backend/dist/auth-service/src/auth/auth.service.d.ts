import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { UserPayloadDto } from './dto/login-response.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(usuario: string, clave: string): Promise<UserPayloadDto | null>;
    login(usuario: string, clave: string): Promise<{
        access_token: string;
        user: UserPayloadDto;
    }>;
    private toUserPayload;
}
