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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const login_response_dto_1 = require("./dto/login-response.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async loginPost(dto) {
        return this.authService.login(dto.usuario, dto.clave);
    }
    async loginGet(query) {
        if (!query.usuario || !query.clave) {
            throw new common_1.UnauthorizedException('Se requieren usuario y clave');
        }
        return this.authService.login(query.usuario, query.clave);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login (POST)', description: 'Autenticación con usuario y clave. Devuelve JWT y datos del usuario.' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginBodyDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Login correcto', type: login_response_dto_1.LoginResponseDto }),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginBodyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginPost", null);
__decorate([
    (0, common_1.Get)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login (GET)', description: 'Autenticación por query params (usuario, clave). Devuelve JWT y datos del usuario.' }),
    (0, swagger_1.ApiQuery)({ name: 'usuario', required: true, example: 'usuario@ejemplo.com' }),
    (0, swagger_1.ApiQuery)({ name: 'clave', required: true, example: 'clave123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login correcto', type: login_response_dto_1.LoginResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginQueryDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginGet", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, swagger_1.ApiTags)('Auth'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciales inválidas' }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map