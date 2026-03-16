import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { ParsePositiveIntPipe } from './parse-positive-int.pipe';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('Posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear publicación' })
  @ApiResponse({ status: 201, description: 'Publicación creada', type: PostResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Req() req: { user: { id: number } },
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const createdAt = dto.createdAt ? new Date(dto.createdAt) : undefined;
    return this.postService.create(req.user.id, dto.message, createdAt);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar publicaciones (todas, incluidas las propias)' })
  @ApiResponse({ status: 200, description: 'Lista de publicaciones', type: [PostResponseDto] })
  async findAll(@Req() req: { user: { id: number } }): Promise<PostResponseDto[]> {
    return this.postService.findAllOtherUsersPosts(req.user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar like (ejecuta sp_add_like_and_log y notifica por WebSocket)' })
  @ApiResponse({ status: 200, description: 'Like registrado', schema: { properties: { postId: { type: 'number' }, likesCount: { type: 'number' } } } })
  @ApiResponse({ status: 400, description: 'Ya diste like' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
  async like(
    @Req() req: { user: { id: number } },
    @Param('id', ParsePositiveIntPipe) postId: number,
  ): Promise<{ postId: number; likesCount: number }> {
    return this.postService.addLike(req.user.id, postId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitar like' })
  @ApiResponse({ status: 200, description: 'Like eliminado', schema: { properties: { postId: { type: 'number' }, likesCount: { type: 'number' } } } })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
  async unlike(
    @Req() req: { user: { id: number } },
    @Param('id', ParsePositiveIntPipe) postId: number,
  ): Promise<{ postId: number; likesCount: number }> {
    return this.postService.removeLike(req.user.id, postId);
  }
}
