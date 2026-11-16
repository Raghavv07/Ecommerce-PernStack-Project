import "dotenv/config";
import express from "express";
import cors from "cors";

import fs from "node:fs";
import path from "node:path";

import { getEnv } from "./lib/env";
import keepAliveCron from "./lib/cron";

import { authMiddleware } from "./middleware/auth";

import authRouter from "./routes/authRouter";
import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";
import streamRouter from "./routes/streamRouter";
import checkoutRouter from "./routes/checkoutRouter";
import adminRouter from "./routes/adminRouter";
import orderRouter from "./routes/orderRouter";

const env = getEnv();
const app = express();

app.use(express.json());
app.use(cors());
app.use(authMiddleware);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);

const publicDir = path.join(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// Error handling middleware
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Listening on port: ${env.PORT}`);
  if (env.NODE_ENV === "production") {
    keepAliveCron.start();
  }
});
