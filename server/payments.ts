import { createHash, timingSafeEqual } from "node:crypto";
import { config } from "./config";
import { PRICE } from "../shared/product";
export type Payment = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key?: string;
  transaction_status: string;
  fraud_status?: string;
  currency?: string;
  refund_amount?: string;
};
export function verifySignature(
  payment: Payment,
  key = config.MIDTRANS_SERVER_KEY,
): boolean {
  if (
    !key ||
    !payment.signature_key ||
    !/^[a-f\d]{128}$/i.test(payment.signature_key)
  )
    return false;
  const expected = createHash("sha512")
    .update(
      `${payment.order_id}${payment.status_code}${payment.gross_amount}${key}`,
    )
    .digest();
  return timingSafeEqual(expected, Buffer.from(payment.signature_key, "hex"));
}
export function paymentStatus(payment: Payment, previous: string): string {
  if (
    Number(payment.gross_amount) !== PRICE ||
    (payment.currency && payment.currency !== "IDR")
  )
    throw new Error("Nominal atau mata uang pembayaran tidak sesuai.");
  const s = payment.transaction_status;
  if (s === "refund" || s === "chargeback") return "revoked";
  if (s === "partial_refund" || s === "partial_chargeback") return previous;
  if (previous === "revoked" || previous === "paid") return previous;
  if (
    s === "settlement" ||
    (s === "capture" && payment.fraud_status === "accept")
  )
    return "paid";
  if (s === "pending") return "pending";
  if (s === "expire") return "expired";
  if (s === "deny" || s === "cancel" || s === "failure") return "failed";
  return previous;
}
const basic = () =>
  `Basic ${Buffer.from(`${config.MIDTRANS_SERVER_KEY}:`).toString("base64")}`;
export async function createCheckout(
  orderId: string,
  email: string,
  name: string,
): Promise<string> {
  if (!config.MIDTRANS_SERVER_KEY || !config.MIDTRANS_CLIENT_KEY)
    throw new Error(
      "Pembayaran uji belum dikonfigurasi. Silakan hubungi pengelola.",
    );
  const host =
    config.PAYMENT_MODE === "sandbox"
      ? "app.sandbox.midtrans.com"
      : "app.midtrans.com";
  const response = await fetch(`https://${host}/snap/v1/transactions`, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: { Authorization: basic(), "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: PRICE },
      item_details: [
        {
          id: "aichemy-lifetime",
          name: "Aichemy Akses Lifetime",
          price: PRICE,
          quantity: 1,
        },
      ],
      customer_details: { email, first_name: name },
      callbacks: { finish: `${config.APP_URL}/pesanan/${orderId}` },
    }),
  });
  if (!response.ok)
    throw new Error("Checkout belum dapat dibuka. Coba lagi sebentar.");
  const data = (await response.json()) as { redirect_url: string };
  return data.redirect_url;
}
export async function getPayment(orderId: string): Promise<Payment> {
  const host =
    config.PAYMENT_MODE === "sandbox"
      ? "api.sandbox.midtrans.com"
      : "api.midtrans.com";
  const response = await fetch(
    `https://${host}/v2/${encodeURIComponent(orderId)}/status`,
    { headers: { Authorization: basic() }, signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw new Error("Status pembayaran belum tersedia.");
  return (await response.json()) as Payment;
}
