import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, type UserRole } from "../db/schema.js";
import { hashPassword, comparePassword } from "../lib/crypto.js";
import { signJwtToken } from "../lib/jwt.js";
import { getUserByEmail, getUserById } from "../lib/users.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().trim().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const guestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, displayName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        displayName: displayName || normalizedEmail.split("@")[0],
        role: "customer" as UserRole,
      })
      .returning();

    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
    });

    const { passwordHash: _hash, ...safeUser } = newUser;
    res.status(201).json({
      token,
      user: safeUser,
      message: "Registration successful",
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await getUserByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });

    const { passwordHash: _hash, ...safeUser } = user;
    res.json({
      token,
      user: safeUser,
      message: "Login successful",
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/guest
router.post("/guest", async (req, res, next) => {
  try {
    const parsed = guestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name } = parsed.data;
    const rand = Math.random().toString(36).substring(2, 8);
    const guestEmail = `guest_${Date.now()}_${rand}@guest.local`;

    const [newUser] = await db
      .insert(users)
      .values({
        email: guestEmail,
        passwordHash: "",
        displayName: name,
        role: "customer" as UserRole,
      })
      .returning();

    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
    });

    const { passwordHash: _hash, ...safeUser } = newUser;
    res.status(201).json({
      token,
      user: safeUser,
      message: "Guest session started successfully",
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { passwordHash: _hash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.json({ ok: true, message: "Logged out successfully" });
});

export default router;
