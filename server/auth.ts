import { betterAuth } from "better-auth";
import nodemailer from "nodemailer";
import { config } from "./config";
import { pool } from "./db";
const transport = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  ...(config.SMTP_USER
    ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } }
    : {}),
});
async function mail(to: string, subject: string, url: string, label: string) {
  await transport.sendMail({
    from: config.MAIL_FROM,
    to,
    subject,
    text: `${label}\n\n${url}\n\nAbaikan email ini jika bukan Anda yang memintanya. — Aichemy`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#242238"><h1>Aichemy ✦</h1><h2>${subject}</h2><p>${label}</p><p><a href="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}" style="display:inline-block;padding:14px 22px;background:#5a43e8;color:white;border-radius:12px;text-decoration:none">${label}</a></p><p>Abaikan email ini jika bukan Anda yang memintanya.</p></div>`,
  });
}
export const auth = betterAuth({
  appName: "Aichemy",
  baseURL: config.APP_URL,
  secret: config.BETTER_AUTH_SECRET,
  database: pool,
  trustedOrigins: [config.APP_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) =>
      mail(user.email, "Atur ulang kata sandi", url, "Atur ulang kata sandi"),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) =>
      mail(
        user.email,
        "Verifikasi email Aichemy",
        url,
        "Verifikasi email saya",
      ),
  },
  session: { expiresIn: 60 * 60 * 24 * 14, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
  advanced: {
    useSecureCookies: config.NODE_ENV === "production",
    database: { generateId: () => crypto.randomUUID() },
  },
});
