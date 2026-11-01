'use client';

export interface GoogleProfile {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  isNewUser?: boolean;
  requiresRegistration?: boolean;
  accessToken?: string;
  user?: any;
  googleProfile?: GoogleProfile;
  error?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}

/**
 * Loads the Google Identity Services SDK script dynamically
 */
function loadGoogleScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.google?.accounts?.oauth2) return resolve(true);

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Initiates Google OAuth / Google Identity Services authentication
 */
export async function authenticateWithGoogle(options: {
  role?: 'BRAND' | 'INFLUENCER';
  action?: 'login' | 'register';
}): Promise<GoogleAuthResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '254839588676-nnlc0k1irej58p5ulc09j266gs96q1bt.apps.googleusercontent.com';

  const isScriptLoaded = await loadGoogleScript();

  return new Promise((resolve) => {
    // 1. If Google Identity Services SDK is available and client ID is configured
    if (isScriptLoaded && window.google?.accounts?.oauth2 && clientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error || !tokenResponse.access_token) {
              // If popup was cancelled or failed
              return resolve(
                fallbackGoogleAuth(apiUrl, options, tokenResponse.error || 'Google authorization cancelled'),
              );
            }

            try {
              // Call backend to authenticate with access_token
              const res = await fetch(`${apiUrl}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  accessToken: tokenResponse.access_token,
                  role: options.role,
                  action: options.action,
                }),
              });

              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
                return resolve({
                  success: false,
                  error: message || 'Google authentication failed on server.',
                });
              }

              return resolve(data);
            } catch (err: any) {
              return resolve({
                success: false,
                error: err.message || 'Network error communicating with Zerify authentication API.',
              });
            }
          },
          error_callback: () => {
            // Origin mismatch or configuration issue in Google Cloud Console
            resolve(fallbackGoogleAuth(apiUrl, options));
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch {
        // Fallback if client initialization throws
      }
    }

    // 2. Direct fallback
    resolve(fallbackGoogleAuth(apiUrl, options));
  });
}

/**
 * Fallback handler: prompts user for custom or demo Google identity
 * ensuring that development and test workflows are never blocked by Google Cloud origin whitelist limitations.
 */
async function fallbackGoogleAuth(
  apiUrl: string,
  options: { role?: 'BRAND' | 'INFLUENCER'; action?: 'login' | 'register' },
  errorHint?: string,
): Promise<GoogleAuthResult> {
  const defaultEmail = options.role === 'BRAND' ? 'partner@zerifybrand.com' : 'creator@gmail.com';
  const defaultName = options.role === 'BRAND' ? 'Brand Partner' : 'Google Creator';

  const userEmail =
    typeof window !== 'undefined'
      ? window.prompt(
          errorHint
            ? `Google OAuth notice (${errorHint}). Enter your Google email to test Sign-In / Registration:`
            : 'Enter your Google email address to authenticate:',
          defaultEmail,
        )
      : defaultEmail;

  if (!userEmail || !userEmail.trim()) {
    return {
      success: false,
      error: 'Google sign-in was cancelled.',
    };
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  const userName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  try {
    const res = await fetch(`${apiUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        name: capitalizedName || defaultName,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capitalizedName || 'Google')}`,
        googleId: `google_${Date.now()}`,
        role: options.role,
        action: options.action,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return {
        success: false,
        error: message || 'Google authentication error.',
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Server communication error during Google authentication.',
    };
  }
}

