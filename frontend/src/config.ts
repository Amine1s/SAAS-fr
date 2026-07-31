// Configuration file for managing environment-specific settings.
// VITE_API_URL should be set in the .env file when deploying the frontend separately.
const rawUrl = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE = rawUrl.replace(/\/+$/, '');

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return cleanPath;
  return `${API_BASE}${cleanPath}`;
};
