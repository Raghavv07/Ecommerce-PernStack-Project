import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool, { schema });
