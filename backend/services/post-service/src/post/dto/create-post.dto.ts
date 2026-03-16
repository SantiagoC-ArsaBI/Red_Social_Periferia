import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Mensaje de la publicación', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;

  @ApiPropertyOptional({ description: 'Fecha de publicación (ISO). Por defecto: ahora' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
