// Zerify Landing Page Environment and App Redirection Configuration

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://app.zerify.in'
    : 'http://localhost:3000');

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.zerify.in/api/v1'
    : 'http://localhost:4000/api/v1');

export const APP_ROUTES = {
  home: APP_URL,
  register: `${APP_URL}/register`,
  login: `${APP_URL}/login`,
  dashboard: `${APP_URL}/dashboard`,
};
