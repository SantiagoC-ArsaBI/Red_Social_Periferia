"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const auth_service_1 = require("../src/auth/auth.service");
const auth_module_1 = require("../src/auth/auth.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
const mockPrisma = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
};
describe('AuthController (integration)', () => {
    let app;
    let authService;
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
        const module = await testing_1.Test.createTestingModule({
            imports: [auth_module_1.AuthModule],
        })
            .overrideProvider(prisma_service_1.PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(auth_service_1.AuthService)
            .useValue(authService)
            .compile();
        app = module.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
        await app.init();
    });
    afterEach(async () => {
        await (app === null || app === void 0 ? void 0 : app.close());
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
            const { UnauthorizedException } = await Promise.resolve().then(() => require('@nestjs/common'));
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
//# sourceMappingURL=auth.controller.spec.js.map