import { Body, Controller, Get, Post, Query, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginQueryDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ status: 401, description: 'Credenciales inválidas' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login (POST)', description: 'Autenticación con usuario y clave. Devuelve JWT y datos del usuario.' })
  @ApiBody({ type: LoginBodyDto })
  @ApiResponse({ status: 201, description: 'Login correcto', type: LoginResponseDto })
  async loginPost(@Body(new ValidationPipe({ whitelist: true })) dto: LoginBodyDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.usuario, dto.clave);
  }

  @Get('login')
  @ApiOperation({
    summary: 'Login (GET)',
    description: 'Autenticación por query params (usuario, clave). Devuelve JWT y datos del usuario. Endpoint incluido por requerimiento técnico; la práctica recomendada en producción es usar el login por POST.',
  })
  @ApiQuery({ name: 'usuario', required: true, example: 'usuario@ejemplo.com' })
  @ApiQuery({ name: 'clave', required: true, example: 'clave123' })
  @ApiResponse({ status: 200, description: 'Login correcto', type: LoginResponseDto })
  async loginGet(@Query() query: LoginQueryDto): Promise<LoginResponseDto> {
    if (!query.usuario || !query.clave) {
      throw new UnauthorizedException('Se requieren usuario y clave');
    }
    return this.authService.login(query.usuario, query.clave);
  }
}
