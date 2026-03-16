import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
}
