import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";
import type { UserRole } from "../db/schema.js";

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  displayName?: string | null;
}

export function signJwtToken(payload: AuthUserPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "7d",
  });
}

export function verifyJwtToken(token: string): AuthUserPayload | null {
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    if (decoded && decoded.userId && decoded.email) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}
