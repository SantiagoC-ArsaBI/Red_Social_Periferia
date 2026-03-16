"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const post_module_1 = require("../src/post/post.module");
const post_service_1 = require("../src/post/post.service");
const jwt_auth_guard_1 = require("../src/common/jwt-auth.guard");
const prisma_service_1 = require("../src/prisma/prisma.service");
const mockPrisma = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
};
let MockJwtGuard = class MockJwtGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 1, email: 'test@example.com' };
        return true;
    }
};
MockJwtGuard = __decorate([
    (0, common_1.Injectable)()
], MockJwtGuard);
describe('PostController (integration)', () => {
    let app;
    let postService;
    const mockPost = {
        id: 1,
        message: 'Hello',
        createdAt: '2025-01-15T12:00:00.000Z',
        authorId: 2,
        author: { id: 2, firstName: 'Jane', lastName: 'Doe', alias: 'jane' },
        likesCount: 0,
    };
    beforeEach(async () => {
        postService = {
            findAllOtherUsersPosts: jest.fn(),
            addLike: jest.fn(),
            create: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            imports: [post_module_1.PostModule],
        })
            .overrideProvider(prisma_service_1.PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(post_service_1.PostService)
            .useValue(postService)
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useClass(MockJwtGuard)
            .compile();
        app = module.createNestApplication();
        await app.init();
    });
    afterEach(async () => {
        await (app === null || app === void 0 ? void 0 : app.close());
    });
    describe('GET /posts', () => {
        it('returns 200 and list of posts', async () => {
            postService.findAllOtherUsersPosts.mockResolvedValue([mockPost]);
            const res = await request(app.getHttpServer())
                .get('/posts')
                .set('Authorization', 'Bearer any-token')
                .expect(200);
            expect(postService.findAllOtherUsersPosts).toHaveBeenCalledWith(1);
            expect(res.body).toEqual([mockPost]);
        });
    });
    describe('POST /posts/:id/like', () => {
        it('returns 200 and postId, likesCount', async () => {
            postService.addLike.mockResolvedValue({ postId: 5, likesCount: 3 });
            const res = await request(app.getHttpServer())
                .post('/posts/5/like')
                .set('Authorization', 'Bearer any-token')
                .expect(200);
            expect(postService.addLike).toHaveBeenCalledWith(1, 5);
            expect(res.body).toEqual({ postId: 5, likesCount: 3 });
        });
    });
});
//# sourceMappingURL=post.controller.spec.js.map