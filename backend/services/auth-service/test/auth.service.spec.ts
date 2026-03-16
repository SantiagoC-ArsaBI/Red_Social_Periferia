import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'Nombre',
    lastName: 'Apellido',
    birthDate: new Date('1990-01-01'),
    alias: 'alias1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'user'>>;
    jwtService = { sign: jest.fn().mockReturnValue('fake-jwt') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('returns token and user when credentials are valid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.access_token).toBe('fake-jwt');
      expect(result.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        firstName: 'Nombre',
        lastName: 'Apellido',
        alias: 'alias1',
      });
      expect(result.user.birthDate).toBe('1990-01-01');
    });

    it('throws UnauthorizedException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login('unknown@example.com', 'pass')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
