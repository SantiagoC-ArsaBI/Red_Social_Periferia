import { PrismaService } from '../prisma/prisma.service';
import { LikesGateway } from './likes.gateway';
import type { PostResponseDto } from './dto/post-response.dto';
export declare class PostService {
    private readonly prisma;
    private readonly likesGateway;
    constructor(prisma: PrismaService, likesGateway: LikesGateway);
    create(userId: number, message: string, createdAt?: Date): Promise<PostResponseDto>;
    findAllOtherUsersPosts(userId: number): Promise<PostResponseDto[]>;
    addLike(userId: number, postId: number): Promise<{
        postId: number;
        likesCount: number;
    }>;
    private toResponse;
}
