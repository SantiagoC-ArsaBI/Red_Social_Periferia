import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() birthDate!: string;
  @ApiProperty() alias!: string;
}
