// Zerify Landing Page Environment and App Redirection Configuration

// In development, automatically allow redirecting to localhost:3000.
// In production, keep it false so the public landing page routes to /coming-soon!
export const ENABLE_PUBLIC_APP =
  process.env.NEXT_PUBLIC_ENABLE_PUBLIC_APP === 'true' ||
  (process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_ENABLE_PUBLIC_APP !== 'false');

// Purely from environment variables - no hardcoded production domains
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

// Allows setting just "https://project-name.onrender.com" in env
// The code automatically appends /api/v1 without requiring it in the env variable
const rawApiUrl = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/+$/, '');

export const API_URL = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl
  : `${rawApiUrl}/api/v1`;

export const APP_ROUTES = {
  home: ENABLE_PUBLIC_APP ? APP_URL : '/',
  register: ENABLE_PUBLIC_APP ? `${APP_URL}/register` : '/coming-soon',
  login: ENABLE_PUBLIC_APP ? `${APP_URL}/login` : '/coming-soon',
  dashboard: ENABLE_PUBLIC_APP ? `${APP_URL}/dashboard` : '/coming-soon',
};

