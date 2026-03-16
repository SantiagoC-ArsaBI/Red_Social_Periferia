"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../src/prisma/prisma.service");
const user_service_1 = require("../src/user/user.service");
describe('UserService', () => {
    let service;
    let prisma;
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
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                user_service_1.UserService,
                { provide: prisma_service_1.PrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get(user_service_1.UserService);
    });
    afterEach(() => jest.clearAllMocks());
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getProfile', () => {
        it('returns profile DTO when user exists', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
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
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.getProfile(999)).rejects.toThrow(common_1.NotFoundException);
            await expect(service.getProfile(999)).rejects.toThrow('Usuario no encontrado');
        });
    });
});
//# sourceMappingURL=user.service.spec.js.map