/**
 * URLs de los servicios backend. En el navegador deben ser localhost
 * cuando todo corre en la misma máquina (docker-compose o local).
 */
const getEnv = (key: string, fallback: string): string => {
  const v = import.meta.env[key];
  return typeof v === 'string' && v.length > 0 ? v : fallback;
};

export const AUTH_API_URL = getEnv('VITE_AUTH_API_URL', 'http://localhost:3001');
export const USER_API_URL = getEnv('VITE_USER_API_URL', 'http://localhost:3002');
export const POST_API_URL = getEnv('VITE_POST_API_URL', 'http://localhost:3003');
export const WS_LIKES_URL = getEnv('VITE_WS_LIKES_URL', 'http://localhost:3003');
