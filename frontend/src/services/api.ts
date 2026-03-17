import { AUTH_API_URL, USER_API_URL, POST_API_URL } from '../config/env';
import type { User } from '../store/authStore';
import type { Post } from '../store/postsStore';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('periferia-auth');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('periferia-auth');
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login';
      }
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      if (j.message) msg = j.message;
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  login: (usuario: string, clave: string) =>
    fetchJson<LoginResponse>(`${AUTH_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ usuario, clave }),
    }),
};

export const userApi = {
  getProfile: () =>
    fetchJson<User>(`${USER_API_URL}/users/profile`),
};

export const postApi = {
  getPosts: () =>
    fetchJson<Post[]>(`${POST_API_URL}/posts/`),
  createPost: (message: string, createdAt?: string) =>
    fetchJson<Post>(`${POST_API_URL}/posts/`, {
      method: 'POST',
      body: JSON.stringify({ message, ...(createdAt && { createdAt }) }),
    }),
  likePost: (postId: number) =>
    fetchJson<{ postId: number; likesCount: number }>(
      `${POST_API_URL}/posts/${postId}/like`,
      { method: 'POST' }
    ),
  unlikePost: (postId: number) =>
    fetchJson<{ postId: number; likesCount: number }>(
      `${POST_API_URL}/posts/${postId}/like`,
      { method: 'DELETE' }
    ),
};
