import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { PostResponseDto } from './dto/post-response.dto';

@WebSocketGateway({
  path: '/likes',
  cors: { origin: '*' },
})
export class LikesGateway {
  @WebSocketServer()
  server!: Server;

  /**
   * Emite a todos los clientes conectados que un post recibió un like.
   */
  broadcastLike(postId: number, likesCount: number): void {
    this.server.emit('like', { postId, likesCount });
  }

  /**
   * Emite a todos los clientes conectados que se creó una nueva publicación.
   */
  broadcastNewPost(post: PostResponseDto): void {
    this.server.emit('post_created', post);
  }
}
