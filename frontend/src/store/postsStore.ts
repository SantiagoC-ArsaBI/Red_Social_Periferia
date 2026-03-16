import { create } from 'zustand';

export interface PostAuthor {
  id: number;
  firstName: string;
  lastName: string;
  alias: string;
}

export interface Post {
  id: number;
  message: string;
  createdAt: string;
  authorId: number;
  author: PostAuthor;
  likesCount: number;
}

interface PostsState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  /** Actualiza solo el likesCount de un post (para WebSocket real-time, incluso en otra pestaña). */
  updateLikeCount: (postId: number, likesCount: number) => void;
  /** Marca que el usuario dio like en este post (para UI). */
  setLikedByMe: (postId: number, liked: boolean) => void;
  likedPostIds: Set<number>;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  likedPostIds: new Set<number>(),
  setPosts: (posts) => set({ posts: [...posts] }),
  updateLikeCount: (postId, likesCount) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, likesCount } : p)),
    })),
  setLikedByMe: (postId, liked) =>
    set((state) => {
      const next = new Set(state.likedPostIds);
      if (liked) next.add(postId);
      else next.delete(postId);
      return { likedPostIds: next };
    }),
}));
