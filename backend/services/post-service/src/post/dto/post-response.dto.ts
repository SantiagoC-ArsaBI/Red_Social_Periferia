import { ApiProperty } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty() id!: number;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() alias!: string;
}

export class PostResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() message!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() authorId!: number;
  @ApiProperty({ type: PostAuthorDto }) author!: PostAuthorDto;
  @ApiProperty() likesCount!: number;
  @ApiProperty({ required: false }) likedByMe?: boolean;
}
