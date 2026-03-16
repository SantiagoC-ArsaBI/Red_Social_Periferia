import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para login por body (POST).
 * Usuario = email; clave = password.
 */
export class LoginBodyDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Email del usuario' })
  @IsEmail()
  @IsNotEmpty()
  usuario!: string;

  @ApiProperty({ example: 'clave123', description: 'Contraseña', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  clave!: string;
}

/**
 * Parámetros de query para login por GET (requerimiento: "Login con JWT (GET)").
 */
export class LoginQueryDto {
  @ApiPropertyOptional({ example: 'usuario@ejemplo.com' })
  @IsOptional()
  @IsEmail()
  usuario?: string;

  @ApiPropertyOptional({ example: 'clave123' })
  @IsOptional()
  @IsString()
  clave?: string;
}
