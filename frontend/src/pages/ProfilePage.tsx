import { useEffect, useState } from 'react';
import { userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const { user: storedUser } = useAuthStore();
  const [profile, setProfile] = useState(storedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .getProfile()
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

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

  const u = profile || storedUser;
  if (!u) return null;

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Mi perfil</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Nombres</dt>
          <dd className="text-slate-800">{u.firstName}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Apellidos</dt>
          <dd className="text-slate-800">{u.lastName}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Alias</dt>
          <dd className="text-slate-800">@{u.alias}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Fecha de nacimiento</dt>
          <dd className="text-slate-800">{u.birthDate}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-slate-500">Correo</dt>
          <dd className="text-slate-800">{u.email}</dd>
        </div>
      </dl>
    </div>
  );
}
