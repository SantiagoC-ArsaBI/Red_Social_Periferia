"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const testing_1 = require("@nestjs/testing");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../src/prisma/prisma.service");
const auth_service_1 = require("../src/auth/auth.service");
describe('AuthService', () => {
    let service;
    let prisma;
    let jwtService;
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
        };
        jwtService = { sign: jest.fn().mockReturnValue('fake-jwt') };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: prisma },
                { provide: jwt_1.JwtService, useValue: jwtService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    });
    afterEach(() => jest.clearAllMocks());
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('login', () => {
        it('returns token and user when credentials are valid', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
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
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.login('unknown@example.com', 'pass')).rejects.toThrow(common_1.UnauthorizedException);
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
        it('throws UnauthorizedException when password does not match', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(common_1.UnauthorizedException);
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map