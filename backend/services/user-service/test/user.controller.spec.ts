import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';
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

describe('UserController (integration)', () => {
  let app: INestApplication;
  let userService: jest.Mocked<Pick<UserService, 'getProfile'>>;

  const mockProfile = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Nombre',
    lastName: 'Apellido',
    birthDate: '1990-05-15',
    alias: 'alias1',
  };

  beforeEach(async () => {
    userService = {
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(UserService)
      .useValue(userService)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('GET /users/profile', () => {
    it('returns 200 and profile when authenticated', async () => {
      userService.getProfile.mockResolvedValue(mockProfile);

      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      expect(userService.getProfile).toHaveBeenCalledWith(1);
      expect(res.body).toEqual(mockProfile);
    });
  });
});
