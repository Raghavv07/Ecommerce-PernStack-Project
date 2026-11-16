import crypto from "node:crypto";

/**
 * Hashes a plain text password using Node.js built-in scrypt KDF.
 * Format returned: "<salt>:<derivedKeyHex>"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Compares a plain text password against a stored scrypt hash using timingSafeEqual.
 */
export function comparePassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, key] = parts;
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);

    return (
      keyBuffer.length === derivedBuffer.length &&
      crypto.timingSafeEqual(keyBuffer, derivedBuffer)
    );
  } catch {
    return false;
  }
}
