"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../src/prisma/prisma.service");
const likes_gateway_1 = require("../src/post/likes.gateway");
const post_service_1 = require("../src/post/post.service");
describe('PostService', () => {
    let service;
    let prisma;
    let likesGateway;
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
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
        };
        likesGateway = {
            broadcastLike: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                post_service_1.PostService,
                { provide: prisma_service_1.PrismaService, useValue: prisma },
                { provide: likes_gateway_1.LikesGateway, useValue: likesGateway },
            ],
        }).compile();
        service = module.get(post_service_1.PostService);
    });
    afterEach(() => jest.clearAllMocks());
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('calls post.create with correct data and returns PostResponseDto', async () => {
            prisma.post.create.mockResolvedValue(mockPostCreated);
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
            prisma.post.create.mockResolvedValue({
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
        it('calls $queryRaw with sp_get_user_feed and maps rows to DTO', async () => {
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
                },
            ];
            prisma.$queryRaw.mockResolvedValue(rows);
            const result = await service.findAllOtherUsersPosts(1);
            expect(prisma.$queryRaw).toHaveBeenCalledWith(client_1.Prisma.sql `SELECT * FROM sp_get_user_feed(${1})`);
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
            prisma.post.findUnique.mockResolvedValue(postWithCount);
            prisma.$executeRaw.mockResolvedValue(undefined);
            const result = await service.addLike(1, 10);
            expect(result).toEqual({ postId: 10, likesCount: 3 });
            expect(likesGateway.broadcastLike).toHaveBeenCalledWith(10, 3);
        });
        it('throws NotFoundException when post does not exist', async () => {
            prisma.post.findUnique.mockResolvedValue(null);
            await expect(service.addLike(1, 999)).rejects.toThrow(common_1.NotFoundException);
            await expect(service.addLike(1, 999)).rejects.toThrow('Publicación no encontrada');
            expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
        });
        it('throws BadRequestException when error message includes LIKE_ALREADY_EXISTS', async () => {
            prisma.post.findUnique.mockResolvedValue(postWithCount);
            prisma.$executeRaw.mockRejectedValue(new Error('LIKE_ALREADY_EXISTS'));
            await expect(service.addLike(1, 10)).rejects.toThrow(common_1.BadRequestException);
            await expect(service.addLike(1, 10)).rejects.toThrow('Ya diste like a esta publicación');
            expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
        });
        it('throws NotFoundException when error message includes INVALID_USER_OR_POST', async () => {
            prisma.post.findUnique.mockResolvedValue(postWithCount);
            prisma.$executeRaw.mockRejectedValue(new Error('INVALID_USER_OR_POST'));
            await expect(service.addLike(1, 10)).rejects.toThrow(common_1.NotFoundException);
            await expect(service.addLike(1, 10)).rejects.toThrow('Usuario o publicación inválidos');
            expect(likesGateway.broadcastLike).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=post.service.spec.js.map