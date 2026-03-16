import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostModule } from '../src/post/post.module';
import { PostService } from '../src/post/post.service';
import { JwtAuthGuard } from '../src/common/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrisma = {
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

@Injectable()
class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 1, email: 'test@example.com' };
    return true;
  }
}

describe('PostController (integration)', () => {
  let app: INestApplication;
  let postService: jest.Mocked<Pick<PostService, 'findAllOtherUsersPosts' | 'addLike' | 'removeLike' | 'create'>>;

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
      removeLike: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PostModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(PostService)
      .useValue(postService)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
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

  describe('DELETE /posts/:id/like', () => {
    it('returns 200 and postId, likesCount', async () => {
      postService.removeLike.mockResolvedValue({ postId: 5, likesCount: 2 });

      const res = await request(app.getHttpServer())
        .delete('/posts/5/like')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      expect(postService.removeLike).toHaveBeenCalledWith(1, 5);
      expect(res.body).toEqual({ postId: 5, likesCount: 2 });
    });
  });
});
