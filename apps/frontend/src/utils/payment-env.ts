/**
 * Zerify Payment Environment Resolver
 * Determines whether the current frontend checkout operates in Sandbox/Development
 * or Live Production mode.
 */

export function isSandboxEnvironment(): boolean {
  // 1. Explicit live production variable overrides (takes top priority)
  if (
    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'production' ||
    process.env.NEXT_PUBLIC_PAYMENT_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production'
  ) {
    return false;
  }

  // 2. Explicit sandbox/development environment variables
  if (
    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'sandbox' ||
    process.env.NEXT_PUBLIC_PAYMENT_ENV === 'sandbox' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'sandbox' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'development'
  ) {
    return true;
  }

  // 3. Next.js build-time development environment
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // 4. Client-side runtime parameters and local development domain checks
  if (typeof window !== 'undefined') {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('sandbox') === 'true' || searchParams.get('env') === 'sandbox') {
        return true;
      }
      if (searchParams.get('sandbox') === 'false' || searchParams.get('env') === 'production') {
        return false;
      }

      const hostname = window.location.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.local') ||
        hostname.includes('ngrok')
      ) {
        return true;
      }
    } catch {}
  }

  // Fallback: only treat as sandbox if NOT a production build
  return process.env.NODE_ENV !== 'production';
}
