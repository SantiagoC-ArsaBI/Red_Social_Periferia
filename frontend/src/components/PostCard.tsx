import { useEffect, useState } from 'react';
import type { Post } from '../store/postsStore';
import { postApi } from '../services/api';
import { usePostsStore } from '../store/postsStore';

interface PostCardProps {
  post: Post;
}

function formatDate(iso: string): string {
  if (!iso || typeof iso !== 'string') return 'Ahora';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Ahora';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PostCard({ post }: PostCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateLikeCount, setLikedByMe, likedPostIds } = usePostsStore();
  const liked = likedPostIds.has(post.id);
  const canLike = Number.isInteger(post.id) && post.id > 0;

  useEffect(() => {
    if (!canLike) setError(null);
  }, [canLike]);

  const handleToggleLike = async () => {
    if (loading || !canLike) return;
    setError(null);
    setLoading(true);
    try {
      const res = liked
        ? await postApi.unlikePost(post.id)
        : await postApi.likePost(post.id);
      setLikedByMe(post.id, !liked);
      updateLikeCount(post.id, res.likesCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : (liked ? 'Error al quitar like' : 'Error al dar like'));
    } finally {
      setLoading(false);
    }
  };

  const author = post.author ?? { id: 0, firstName: '', lastName: '', alias: '' };

  return (
    <article className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-800">
          {author.firstName} {author.lastName}
        </span>
        <span>@{author.alias}</span>
        <span>·</span>
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      </div>
      <p className="whitespace-pre-wrap text-slate-800">{post.message}</p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={loading || !canLike}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
            liked
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-surface-100 text-slate-600 hover:bg-surface-200'
          } ${loading ? 'opacity-60' : ''}`}
          aria-label={liked ? 'Quitar like' : 'Dar like'}
        >
          <span className="text-lg" role="img" aria-hidden>
            {liked ? '❤️' : '🤍'}
          </span>
          <span className="tabular-nums">{post.likesCount}</span>
        </button>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
