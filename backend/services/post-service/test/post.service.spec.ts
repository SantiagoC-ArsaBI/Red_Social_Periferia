import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { LikesGateway } from '../src/post/likes.gateway';
import { PostService } from '../src/post/post.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: jest.Mocked<
    Pick<PrismaService, 'post' | 'like' | '$queryRaw' | '$executeRaw'>
  >;
  let likesGateway: jest.Mocked<Pick<LikesGateway, 'broadcastLike'>>;

  const mockAuthor = {
    id: 1,
    firstName: 'Nombre',
    lastName: 'Apellido',
    alias: 'alias1',
  };

  const mockPostCreated = {
    id: 10,
    message: 'Hello',
    createdAt: new Date('2025-01-15T12:00:00.000Z'),
    authorId: 1,
    author: mockAuthor,
    _count: { likes: 0 },
  };

  beforeEach(async () => {
    prisma = {
      post: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      like: {
        deleteMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
    } as unknown as jest.Mocked<
      Pick<PrismaService, 'post' | 'like' | '$queryRaw' | '$executeRaw'>
    >;
    likesGateway = {
      broadcastLike: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: prisma },
        { provide: LikesGateway, useValue: likesGateway },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('calls post.create with correct data and returns PostResponseDto', async () => {
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPostCreated);

      const result = await service.create(1, 'Hello');

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { message: 'Hello', authorId: 1 },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, alias: true } },
          _count: { select: { likes: true } },
        },
      });
      expect(result).toEqual({
        id: 10,
        message: 'Hello',
        createdAt: '2025-01-15T12:00:00.000Z',
        authorId: 1,
        author: mockAuthor,
        likesCount: 0,
      });
    });

    it('passes createdAt when provided', async () => {
      const customDate = new Date('2025-02-01T10:00:00.000Z');
      (prisma.post.create as jest.Mock).mockResolvedValue({
        ...mockPostCreated,
        createdAt: customDate,
      });

      await service.create(1, 'Msg', customDate);

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { message: 'Msg', authorId: 1, createdAt: customDate },
        include: expect.any(Object),
      });
    });
  });

  describe('findAllOtherUsersPosts', () => {
    it('calls $queryRaw with sp_get_user_feed and maps rows to DTO including likedByMe', async () => {
      const rows = [
        {
          post_id: 5,
          author_id: 2,
          message: 'Other post',
          created_at: new Date('2025-01-10T08:00:00.000Z'),
          likes_count: 3,
          author_first_name: 'Jane',
          author_last_name: 'Doe',
          author_alias: 'jane',
          liked_by_me: true,
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(rows);

      const result = await service.findAllOtherUsersPosts(1);

      expect(prisma.$queryRaw).toHaveBeenCalledWith(Prisma.sql`SELECT * FROM sp_get_user_feed(${1})`);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 5,
        message: 'Other post',
        createdAt: '2025-01-10T08:00:00.000Z',
        authorId: 2,
        author: {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          alias: 'jane',
        },
        likesCount: 3,
        likedByMe: true,
      });
    });
  });

  describe('addLike', () => {
    const postWithCount = {
      id: 10,
      message: 'Post',
      createdAt: new Date(),
      authorId: 1,
      author: mockAuthor,
      _count: { likes: 2 },
    };

    it('returns postId and likesCount and calls broadcastLike when post exists and SP succeeds', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithCount);
      (prisma.$executeRaw as jest.Mock).mockResolvedValue(undefined);

      const result = await service.addLike(1, 10);

      expect(result).toEqual({ postId: 10, likesCount: 3 });
      expect(likesGateway.broadcastLike).toHaveBeenCalledWith(10, 3);
    });

    it('throws NotFoundException when post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addLike(1, 999)).rejects.toThrow(NotFoundException);
      await expect(service.addLike(1, 999)).rejects.toThrow('Publicación no encontrada');
      expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when error message includes LIKE_ALREADY_EXISTS', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithCount);
      (prisma.$executeRaw as jest.Mock).mockRejectedValue(new Error('LIKE_ALREADY_EXISTS'));

      await expect(service.addLike(1, 10)).rejects.toThrow(BadRequestException);
      await expect(service.addLike(1, 10)).rejects.toThrow('Ya diste like a esta publicación');
      expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when error message includes INVALID_USER_OR_POST', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithCount);
      (prisma.$executeRaw as jest.Mock).mockRejectedValue(new Error('INVALID_USER_OR_POST'));

      await expect(service.addLike(1, 10)).rejects.toThrow(NotFoundException);
      await expect(service.addLike(1, 10)).rejects.toThrow('Usuario o publicación inválidos');
      expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    const postWithCount = {
      id: 10,
      message: 'Post',
      createdAt: new Date(),
      authorId: 1,
      author: mockAuthor,
      _count: { likes: 2 },
    };

    it('deletes like, broadcasts new count and returns postId and likesCount', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithCount);
      (prisma.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.removeLike(1, 10);

      expect(prisma.like.deleteMany).toHaveBeenCalledWith({ where: { userId: 1, postId: 10 } });
      expect(result).toEqual({ postId: 10, likesCount: 1 });
      expect(likesGateway.broadcastLike).toHaveBeenCalledWith(10, 1);
    });

    it('throws NotFoundException when post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeLike(1, 999)).rejects.toThrow(NotFoundException);
      await expect(service.removeLike(1, 999)).rejects.toThrow('Publicación no encontrada');
      expect(prisma.like.deleteMany).not.toHaveBeenCalled();
    });

    it('is idempotent when user had not liked (deleteMany returns 0)', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(postWithCount);
      (prisma.like.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await service.removeLike(1, 10);

      expect(result).toEqual({ postId: 10, likesCount: 2 });
      expect(likesGateway.broadcastLike).toHaveBeenCalledWith(10, 2);
    });
  });
});
