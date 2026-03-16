import { useEffect, useState } from 'react';
import { postApi } from '../services/api';
import { connectLikesSocket } from '../services/ws';
import { usePostsStore } from '../store/postsStore';
import { PostCard } from '../components/PostCard';

export function FeedPage() {
  const { posts, setPosts } = usePostsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectLikesSocket();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    postApi
      .getPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setPosts]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-surface-200 bg-white p-8 text-center text-slate-500">
        No hay publicaciones. Crea una para verla aquí.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Feed</h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
