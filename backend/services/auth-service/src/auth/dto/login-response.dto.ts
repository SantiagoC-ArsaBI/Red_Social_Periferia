import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty() id!: number;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() birthDate!: string;
  @ApiProperty() alias!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT de acceso' })
  access_token!: string;

  @ApiProperty({ type: UserPayloadDto, description: 'Datos del usuario (Nombres, Apellidos, Fecha nacimiento, Alias)' })
  user!: UserPayloadDto;
}
