import type { Request, Response, NextFunction } from "express";
import { getAuth } from "../middleware/auth.js";
import { getLocalUser } from "../lib/users.js";
import { getStreamChatServer, streamChatDisplayName, streamUserId } from "../lib/stream.js";
import { getEnv } from "../lib/env.js";

const env = getEnv();

export async function createStreamToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const server = getStreamChatServer(env);

    const name = streamChatDisplayName(
      localUser.role,
      localUser.displayName,
      localUser.email,
    );

    const sid = streamUserId(localUser.id);

    await server.upsertUser({ id: sid, name });

    const token = server.createToken(sid);

    res.json({ token, apiKey: env.STREAM_API_KEY, userId: sid, name });
  } catch (e) {
    next(e);
  }
}
