import type { Request, RequestHandler } from "express";
import { verifyJwtToken, type AuthUserPayload } from "../lib/jwt.js";
import type { UserRole } from "../db/schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Extracts Bearer token from the Authorization header and verifies it.
 * Populates req.user if valid. Does not fail unauthenticated requests (leaves req.user undefined).
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    next();
    return;
  }

  const payload = verifyJwtToken(token);
  if (payload) {
    req.user = payload;
  }

  next();
};

/**
 * Ensures the request is authenticated. Rejects with 401 if not.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

/**
 * Requires the user to have one of the given roles.
 */
export function requireRole(allowedRoles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}

/**
 * Ensures the user has the 'admin' role.
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
};

/**
 * Ensures the user has 'admin' or 'support' role.
 */
export const requireStaff: RequestHandler = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "admin" && req.user.role !== "support") {
    res.status(403).json({ error: "Staff only" });
    return;
  }
  next();
};

/**
 * Helper to retrieve auth information from the request.
 * Drop-in replacement for Clerk's getAuth(req).
 */
export function getAuth(req: Request) {
  const user = req.user;
  return {
    userId: user?.userId ?? null,
    isAuthenticated: Boolean(user?.userId),
    role: user?.role ?? null,
    email: user?.email ?? null,
  };
}
