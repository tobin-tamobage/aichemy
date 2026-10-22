import { z } from "zod";
const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3001),
    APP_URL: z.string().url().default("http://localhost:5173"),
    DATABASE_URL: z.string().default("postgres://localhost:5432/aichemy_dev"),
    BETTER_AUTH_SECRET: z.string().min(32),
    PAYMENT_MODE: z.enum(["sandbox", "production"]).default("sandbox"),
    MIDTRANS_SERVER_KEY: z.string().default(""),
    MIDTRANS_CLIENT_KEY: z.string().default(""),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().default(1025),
    SMTP_USER: z.string().default(""),
    SMTP_PASSWORD: z.string().default(""),
    MAIL_FROM: z.string().default("Aichemy <noreply@localhost>"),
    SUPPORT_EMAIL: z.string().default(""),
    BUSINESS_NAME: z.string().default(""),
    ADMIN_EMAILS: z.string().default(""),
  })
  .parse(process.env);
export const config = {
  ...env,
  adminEmails: env.ADMIN_EMAILS.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};
if (
  config.NODE_ENV === "production" &&
  (!config.APP_URL.startsWith("https://") ||
    !config.SUPPORT_EMAIL ||
    !config.BUSINESS_NAME ||
    ["localhost", "mailpit"].includes(config.SMTP_HOST) ||
    /development|test-only|replace-with/.test(config.BETTER_AUTH_SECRET))
) {
  throw new Error(
    "Produksi memerlukan APP_URL HTTPS, SUPPORT_EMAIL, BUSINESS_NAME, dan SMTP_HOST.",
  );
}
