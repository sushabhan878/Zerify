/**
 * Utility to identify public / free / disposable email domains.
 * Zerify Brands are required to register with their official business / work domain.
 */
export const PUBLIC_EMAIL_DOMAINS = new Set([
  // Google
  'gmail.com',
  'googlemail.com',

  // Yahoo
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',
  'yahoo.com.au',
  'yahoo.com.br',
  'yahoo.co.jp',
  'ymail.com',
  'rocketmail.com',

  // Microsoft
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.es',
  'hotmail.it',
  'outlook.com',
  'outlook.in',
  'outlook.fr',
  'outlook.es',
  'live.com',
  'live.co.uk',
  'msn.com',
  'passport.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // AOL
  'aol.com',
  'aim.com',

  // Zoho (Personal free)
  'zoho.com',
  'zohomail.com',

  // Privacy / Webmail
  'proton.me',
  'protonmail.com',
  'pm.me',
  'tutanota.com',
  'tutamail.com',
  'tuta.io',
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'yandex.com',
  'yandex.ru',
  'fastmail.com',
  'fastmail.fm',
  'rediffmail.com',
  'inbox.com',

  // Asian webmail
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'mail.ru',

  // Disposable
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'mailinator.com',
  'throwawaymail.com',
]);

export function isPublicEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return PUBLIC_EMAIL_DOMAINS.has(domain);
}

export function isProfessionalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain || !domain.includes('.')) return false;
  return !PUBLIC_EMAIL_DOMAINS.has(domain);
}
