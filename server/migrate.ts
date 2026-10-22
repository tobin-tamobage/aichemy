import { getMigrations } from "better-auth/db/migration";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { auth } from "./auth";
import { db, pool } from "./db";
await (await getMigrations(auth.options)).runMigrations();
await migrate(db, { migrationsFolder: "./server/db/migrations" });
await pool.end();
console.log("Migrasi Aichemy selesai.");
