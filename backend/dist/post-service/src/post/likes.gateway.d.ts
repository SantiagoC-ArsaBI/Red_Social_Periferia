import { Server } from 'socket.io';
export declare class LikesGateway {
    server: Server;
    broadcastLike(postId: number, likesCount: number): void;
}
