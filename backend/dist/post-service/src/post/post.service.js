"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const likes_gateway_1 = require("./likes.gateway");
let PostService = class PostService {
    constructor(prisma, likesGateway) {
        this.prisma = prisma;
        this.likesGateway = likesGateway;
    }
    async create(userId, message, createdAt) {
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
        return this.toResponse(post);
    }
    async findAllOtherUsersPosts(userId) {
        const rows = await this.prisma.$queryRaw(client_1.Prisma.sql `SELECT * FROM sp_get_user_feed(${userId})`);
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
        }));
    }
    async addLike(userId, postId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: { _count: { select: { likes: true } } },
        });
        if (!post) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        try {
            await this.prisma.$executeRaw(client_1.Prisma.sql `SELECT sp_add_like_and_log(${userId}, ${postId})`);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes('LIKE_ALREADY_EXISTS')) {
                throw new common_1.BadRequestException('Ya diste like a esta publicación');
            }
            if (msg.includes('INVALID_USER_OR_POST')) {
                throw new common_1.NotFoundException('Usuario o publicación inválidos');
            }
            throw e;
        }
        const newCount = post._count.likes + 1;
        this.likesGateway.broadcastLike(postId, newCount);
        return { postId, likesCount: newCount };
    }
    toResponse(p) {
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
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        likes_gateway_1.LikesGateway])
], PostService);
//# sourceMappingURL=post.service.js.map