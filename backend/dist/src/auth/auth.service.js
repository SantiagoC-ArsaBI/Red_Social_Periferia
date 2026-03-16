"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(usuario, clave) {
        const user = await this.prisma.user.findUnique({
            where: { email: usuario },
        });
        if (!user || !(await bcrypt.compare(clave, user.password))) {
            return null;
        }
        return this.toUserPayload(user);
    }
    async login(usuario, clave) {
        var _a;
        const user = await this.validateUser(usuario, clave);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const access_token = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: (_a = process.env.JWT_EXPIRES_IN) !== null && _a !== void 0 ? _a : '7d' });
        return { access_token, user };
    }
    toUserPayload(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate.toISOString().slice(0, 10),
            alias: user.alias,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map