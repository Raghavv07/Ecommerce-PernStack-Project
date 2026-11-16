import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess(
    (val) => (val === "" || val === undefined ? 3001 : Number(val)),
    z.number().int().positive().default(3001),
  ),
  DATABASE_URL: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim().length > 0) return val.trim();
      if (process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL_UNPOOLED.trim().length > 0) {
        return process.env.DATABASE_URL_UNPOOLED.trim();
      }
      return val;
    },
    z.string().min(1, "Database connection URL is required"),
  ),

  JWT_SECRET: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim() : "ecommerce_jwt_secret_super_secure_key_12345"),
    z.string().min(1).default("ecommerce_jwt_secret_super_secure_key_12345"),
  ),
  JWT_EXPIRES_IN: z.string().default("7d"),

  FRONTEND_URL: z
    .string()
    .url()
    .or(z.literal(""))
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : "http://localhost:5173")),

  BACKEND_URL: z.string().url().or(z.literal("")).optional(),
  RENDER_EXTERNAL_URL: z.string().url().or(z.literal("")).optional(),

  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Environment validation error:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

let cachedEnv: Env | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }

  return cachedEnv;
}
