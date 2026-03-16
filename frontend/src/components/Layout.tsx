import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated()) return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <nav className="sticky top-0 z-10 border-b border-surface-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-primary-600">
            Red Social
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-primary-600"
            >
              Feed
            </Link>
            <Link
              to="/create"
              className="text-sm font-medium text-slate-600 hover:text-primary-600"
            >
              Crear publicación
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium text-slate-600 hover:text-primary-600"
            >
              Perfil
            </Link>
            <span className="text-sm text-slate-500">@{user?.alias}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
