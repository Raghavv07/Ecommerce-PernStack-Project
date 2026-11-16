import { Router } from "express";
import { getAuth } from "../middleware/auth.js";
import { getLocalUser } from "../lib/users.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getLocalUser(userId);
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

export default router;
