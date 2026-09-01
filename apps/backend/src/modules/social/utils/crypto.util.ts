import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getSecretKey(): Buffer {
  const secret =
    process.env.SOCIAL_ENCRYPTION_SECRET ||
    process.env.JWT_SECRET ||
    'zerify-social-encryption-secret-default-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a raw OAuth token string using AES-256-GCM.
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv_hex:authTag_hex:encrypted_hex
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an encrypted token string using AES-256-GCM.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return '';
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getSecretKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Generates an encrypted OAuth state token containing user context and timestamp.
 */
export function generateOAuthState(userId: string): string {
  const payload = JSON.stringify({
    userId,
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString('hex'),
  });
  return encryptToken(payload);
}

/**
 * Verifies and parses an OAuth state token.
 */
export function verifyOAuthState(
  state: string,
  maxAgeMs = 15 * 60 * 1000,
): { userId: string; isValid: boolean } {
  if (!state || typeof state !== 'string') {
    return { userId: '', isValid: false };
  }
  try {
    const decrypted = decryptToken(state);
    const payload = JSON.parse(decrypted);

    if (!payload.userId || !payload.ts) {
      return { userId: '', isValid: false };
    }

    const age = Date.now() - payload.ts;
    if (age < 0 || age > maxAgeMs) {
      return { userId: payload.userId, isValid: false };
    }

    return { userId: payload.userId, isValid: true };
  } catch {
    return { userId: '', isValid: false };
  }
}
