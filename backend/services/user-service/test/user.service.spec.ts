import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserService } from '../src/user/user.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Nombre',
    lastName: 'Apellido',
    birthDate: new Date('1990-05-15'),
    alias: 'alias1',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'user'>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('returns profile DTO when user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          alias: true,
        },
      });
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Nombre',
        lastName: 'Apellido',
        birthDate: '1990-05-15',
        alias: 'alias1',
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
      await expect(service.getProfile(999)).rejects.toThrow('Usuario no encontrado');
    });
  });
});
