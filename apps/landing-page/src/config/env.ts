// Zerify Landing Page Environment and App Redirection Configuration

// If true, enables direct redirection to the live web app.
// Default is false: Public landing page routes to /coming-soon so your internal app URL stays private!
export const ENABLE_PUBLIC_APP = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_APP === 'true';

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
  home: ENABLE_PUBLIC_APP ? APP_URL : '/',
  register: ENABLE_PUBLIC_APP ? `${APP_URL}/register` : '/coming-soon',
  login: ENABLE_PUBLIC_APP ? `${APP_URL}/login` : '/coming-soon',
  dashboard: ENABLE_PUBLIC_APP ? `${APP_URL}/dashboard` : '/coming-soon',
};

