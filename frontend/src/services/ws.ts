import { io } from 'socket.io-client';
import { WS_LIKES_URL } from '../config/env';
import { usePostsStore, type Post } from '../store/postsStore';

let socket: ReturnType<typeof io> | null = null;

export function connectLikesSocket(): void {
  if (socket?.connected) return;
  socket = io(WS_LIKES_URL, {
    path: '/likes',
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  socket.on('connect', () => {
    console.debug('[WS] Likes socket connected');
  });
  socket.on('like', (payload: { postId: number; likesCount: number }) => {
    usePostsStore.getState().updateLikeCount(payload.postId, payload.likesCount);
  });
  socket.on('post_created', (post: Post) => {
    usePostsStore.getState().prependPost(post);
  });
  socket.on('disconnect', () => {
    console.debug('[WS] Likes socket disconnected');
  });
}

export function disconnectLikesSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
