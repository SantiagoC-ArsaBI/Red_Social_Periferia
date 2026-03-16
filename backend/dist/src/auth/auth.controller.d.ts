import { AuthService } from './auth.service';
import { LoginBodyDto, LoginQueryDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginPost(dto: LoginBodyDto): Promise<LoginResponseDto>;
    loginGet(query: LoginQueryDto): Promise<LoginResponseDto>;
}
