/**
 * Cashfree Web SDK v3 Dynamic Loader
 * Loads the official Cashfree JS SDK without requiring node module dependencies.
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_blank' | '_top' | '_modal';
        returnUrl?: string;
      }) => Promise<any>;
    };
  }
}

let cashfreePromise: Promise<any> | null = null;

export function loadCashfreeSDK(mode: 'sandbox' | 'production' = 'sandbox'): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree({ mode }));
  }

  if (cashfreePromise) {
    return cashfreePromise;
  }

  cashfreePromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('cashfree-sdk-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Cashfree) resolve(window.Cashfree({ mode }));
        else reject(new Error('Cashfree SDK failed to initialize'));
      });
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'cashfree-sdk-script';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;

    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree({ mode }));
      } else {
        reject(new Error('Cashfree SDK object not found on window'));
      }
    };

    script.onerror = () => {
      cashfreePromise = null;
      reject(new Error('Failed to load Cashfree checkout SDK'));
    };

    document.head.appendChild(script);
  });

  return cashfreePromise;
}
