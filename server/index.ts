import { createServer } from "./app";
import { config } from "./config";
import { pool } from "./db";
const app = await createServer();
await app.listen({
  port: config.PORT,
  host: config.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await app.close();
    await pool.end();
    process.exit(0);
  });
