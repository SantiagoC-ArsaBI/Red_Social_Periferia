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
  likedByMe?: boolean;
}

interface PostsState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  /** Añade una publicación al inicio (p. ej. tras crear una nueva). */
  prependPost: (post: Post) => void;
  /** Actualiza solo el likesCount de un post (para WebSocket real-time, incluso en otra pestaña). */
  updateLikeCount: (postId: number, likesCount: number) => void;
  /** Marca que el usuario dio like en este post (para UI). */
  setLikedByMe: (postId: number, liked: boolean) => void;
  likedPostIds: Set<number>;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  likedPostIds: new Set<number>(),
  setPosts: (posts) =>
    set((state) => {
      const fromApi = posts;
      const onlyLocal = state.posts.filter((p) => !fromApi.some((d) => d.id === p.id));
      const merged = [...onlyLocal, ...fromApi];
      return {
        posts: merged,
        likedPostIds: new Set(fromApi.filter((p) => p.likedByMe === true).map((p) => p.id)),
      };
    }),
  prependPost: (post) =>
    set((state) => {
      const normalized: Post = { ...post, likedByMe: post.likedByMe ?? false };
      const withoutDup = state.posts.filter((p) => p.id !== normalized.id);
      return {
        posts: [normalized, ...withoutDup],
      };
    }),
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
