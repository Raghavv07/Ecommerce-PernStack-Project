import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";

// Every 14 minutes send a GET request to the backend health endpoint to keep Render free tier awake
const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;
  if (!base) return;

  try {
    const url = new URL("/health", base).href;
    const client = url.startsWith("https:") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode === 200) console.log("[keep-alive] Health ping sent successfully");
        else console.log("[keep-alive] Health ping status:", res.statusCode);
      })
      .on("error", (e) => console.error("[keep-alive] Error while sending ping:", (e as Error).message));
  } catch (err) {
    console.error("[keep-alive] Invalid keep-alive URL configuration:", err);
  }
});

export default job;
