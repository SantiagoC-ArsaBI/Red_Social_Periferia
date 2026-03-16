import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usuario.trim()) {
      setError('El correo es obligatorio.');
      return;
    }
    if (!clave) {
      setError('La contraseña es obligatoria.');
      return;
    }
    if (clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(usuario.trim(), clave);
      setAuth(res.access_token, res.user);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-primary-50/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
          Red Social
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Inicia sesión para continuar
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="usuario" className="mb-1 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="usuario"
              type="email"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="clave" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-surface-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
