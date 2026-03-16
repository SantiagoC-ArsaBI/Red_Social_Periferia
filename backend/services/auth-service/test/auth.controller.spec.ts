import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrisma = {
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;

  const loginResponse = {
    access_token: 'fake-jwt',
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Nombre',
      lastName: 'Apellido',
      birthDate: '1990-01-01',
      alias: 'alias1',
    },
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('POST /auth/login', () => {
    it('returns 201 and token when credentials are valid', async () => {
      authService.login.mockResolvedValue(loginResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usuario: 'test@example.com', clave: 'password123' })
        .expect(201);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.body).toEqual(loginResponse);
    });

    it('returns 401 when AuthService throws', async () => {
      const { UnauthorizedException } = await import('@nestjs/common');
      authService.login.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usuario: 'bad@example.com', clave: 'wrong123' })
        .expect(401);
    });

    it('returns 400 for invalid body (e.g. missing clave)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usuario: 'test@example.com' })
        .expect(400);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
