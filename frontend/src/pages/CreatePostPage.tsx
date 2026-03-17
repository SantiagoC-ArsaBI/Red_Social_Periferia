import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';

const MAX_MESSAGE_LENGTH = 2000;

export function CreatePostPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { prependPost, setPosts } = usePostsStore();
  const [message, setMessage] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ message?: string }>({});

  const validate = (): boolean => {
    const err: { message?: string } = {};
    const trimmed = message.trim();
    if (!trimmed) {
      err.message = 'El mensaje no puede estar vacío.';
    } else if (trimmed.length > MAX_MESSAGE_LENGTH) {
      err.message = `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmedMessage = message.trim();
      const createdAtIso = createdAt.trim()
        ? new Date(createdAt).toISOString()
        : new Date().toISOString();
      const created = await postApi.createPost(trimmedMessage, createdAt.trim() || undefined);
      const id = created.id;
      if (!Number.isInteger(id) || id < 1) {
        // Si por algún motivo no recibimos un id válido, recargamos el feed completo
        const data = await postApi.getPosts();
        setPosts(data);
        navigate('/', { replace: true });
        return;
      }
      const author =
        created.author ||
        (user
          ? { id: user.id, firstName: user.firstName, lastName: user.lastName, alias: user.alias }
          : { id: created.authorId, firstName: '', lastName: '', alias: '' });
      const postToPrepend = {
        id,
        message: created.message ?? trimmedMessage,
        createdAt: created.createdAt ?? createdAtIso,
        authorId: created.authorId ?? user?.id ?? 0,
        author,
        likesCount: created.likesCount ?? 0,
        likedByMe: false,
      };
      prependPost(postToPrepend);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">
        Crear publicación
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Qué quieres compartir?"
            rows={4}
            maxLength={MAX_MESSAGE_LENGTH + 1}
            className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-invalid={!!fieldErrors.message}
            aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span id="message-error" className="text-red-600">
              {fieldErrors.message}
            </span>
            <span>{message.length} / {MAX_MESSAGE_LENGTH}</span>
          </div>
        </div>
        <div>
          <label htmlFor="createdAt" className="mb-1 block text-sm font-medium text-slate-700">
            Fecha de publicación <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="createdAt"
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="mt-1 text-xs text-slate-500">
            Si no eliges fecha, se usará la fecha y hora actual al guardar.
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Publicando…' : 'Publicar'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg bg-surface-100 px-4 py-2.5 font-medium text-slate-700 hover:bg-surface-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
