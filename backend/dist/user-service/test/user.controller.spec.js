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
const user_module_1 = require("../src/user/user.module");
const user_service_1 = require("../src/user/user.service");
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
describe('UserController (integration)', () => {
    let app;
    let userService;
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
        const module = await testing_1.Test.createTestingModule({
            imports: [user_module_1.UserModule],
        })
            .overrideProvider(prisma_service_1.PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(user_service_1.UserService)
            .useValue(userService)
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useClass(MockJwtGuard)
            .compile();
        app = module.createNestApplication();
        await app.init();
    });
    afterEach(async () => {
        await (app === null || app === void 0 ? void 0 : app.close());
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
//# sourceMappingURL=user.controller.spec.js.map