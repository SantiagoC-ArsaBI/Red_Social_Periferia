import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LikesGateway } from './likes.gateway';
import type { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly likesGateway: LikesGateway,
  ) {}

  async create(userId: number, message: string, createdAt?: Date): Promise<PostResponseDto> {
    const post = await this.prisma.post.create({
      data: {
        message,
        authorId: userId,
        ...(createdAt && { createdAt }),
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, alias: true } },
        _count: { select: { likes: true } },
      },
    });
    const response = this.toResponse(post);
    this.likesGateway.broadcastNewPost(response);
    return response;
  }

  async findAllOtherUsersPosts(userId: number): Promise<PostResponseDto[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        post_id: number;
        author_id: number;
        message: string;
        created_at: Date;
        likes_count: number;
        author_first_name: string;
        author_last_name: string;
        author_alias: string;
        liked_by_me: boolean;
      }>
    >(Prisma.sql`SELECT * FROM sp_get_user_feed(${userId})`);

    return rows.map((r) => ({
      id: r.post_id,
      message: r.message,
      createdAt: r.created_at.toISOString(),
      authorId: r.author_id,
      author: {
        id: r.author_id,
        firstName: r.author_first_name,
        lastName: r.author_last_name,
        alias: r.author_alias,
      },
      likesCount: r.likes_count,
      likedByMe: r.liked_by_me,
    }));
  }

  /**
   * Registra un like usando el SP sp_add_like_and_log (like + auditoría en una transacción).
   */
  async addLike(userId: number, postId: number): Promise<{ postId: number; likesCount: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { _count: { select: { likes: true } } },
    });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    try {
      await this.prisma.$executeRaw(
        Prisma.sql`SELECT sp_add_like_and_log(${userId}, ${postId})`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('LIKE_ALREADY_EXISTS')) {
        throw new BadRequestException('Ya diste like a esta publicación');
      }
      if (msg.includes('INVALID_USER_OR_POST')) {
        throw new NotFoundException('Usuario o publicación inválidos');
      }
      throw e;
    }
    const newCount = post._count.likes + 1;
    this.likesGateway.broadcastLike(postId, newCount);
    return { postId, likesCount: newCount };
  }

  /**
   * Quita el like del usuario al post. Idempotente si no existía el like.
   */
  async removeLike(userId: number, postId: number): Promise<{ postId: number; likesCount: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { _count: { select: { likes: true } } },
    });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const deleted = await this.prisma.like.deleteMany({
      where: { userId, postId },
    });
    const newCount = Math.max(0, post._count.likes - deleted.count);
    this.likesGateway.broadcastLike(postId, newCount);
    return { postId, likesCount: newCount };
  }

  private toResponse(
    p: {
      id: number;
      message: string;
      createdAt: Date;
      authorId: number;
      author: { id: number; firstName: string; lastName: string; alias: string };
      _count: { likes: number };
    },
  ): PostResponseDto {
    return {
      id: p.id,
      message: p.message,
      createdAt: p.createdAt.toISOString(),
      authorId: p.authorId,
      author: {
        id: p.author.id,
        firstName: p.author.firstName,
        lastName: p.author.lastName,
        alias: p.author.alias,
      },
      likesCount: p._count.likes,
    };
  }
}
