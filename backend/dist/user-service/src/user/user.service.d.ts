import { PrismaService } from '../prisma/prisma.service';
import type { ProfileResponseDto } from './dto/profile-response.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<ProfileResponseDto>;
}
