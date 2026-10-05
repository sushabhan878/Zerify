/**
 * Utility to identify public / disposable / free webmail providers.
 * For Zerify Brands / Agencies, only professional work / corporate domain emails are allowed.
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

  // Proton / Privacy / Webmail
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

  // Chinese / Asian webmail
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'mail.ru',

  // Disposable / Temporary mail domains
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'mailinator.com',
  'throwawaymail.com',
]);

/**
 * Checks if the email belongs to a public or free webmail domain.
 */
export function isPublicEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return PUBLIC_EMAIL_DOMAINS.has(domain);
}

/**
 * Checks if the email is a valid professional / business email domain (non-public).
 */
export function isProfessionalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain || !domain.includes('.')) return false;
  return !PUBLIC_EMAIL_DOMAINS.has(domain);
}
