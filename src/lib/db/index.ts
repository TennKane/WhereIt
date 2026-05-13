import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

// 自动建表（生产环境 Turso / 本地 SQLite 均适用）
migrate(db, { migrationsFolder: "./src/lib/db/migrations" }).catch(() => {
  // 静默处理，首次并发时可能冲突
});
