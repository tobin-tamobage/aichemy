import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  paymentStatus,
  verifySignature,
  type Payment,
} from "../server/payments";
import { historyReducer, type History } from "../web/history";
import { DOMAINS } from "../domains";
import { describeStudio } from "../server/studios";
import { PRICE } from "../shared/product";
const payment = (status: string): Payment => ({
  order_id: crypto.randomUUID(),
  status_code: "200",
  gross_amount: String(PRICE),
  transaction_status: status,
  currency: "IDR",
});
test("pembayaran memerlukan nominal tepat dan signature yang sah", () => {
  const p = payment("settlement");
  const key = "test-server-key";
  p.signature_key = createHash("sha512")
    .update(p.order_id + p.status_code + p.gross_amount + key)
    .digest("hex");
  assert.equal(verifySignature(p, key), true);
  assert.equal(verifySignature({ ...p, gross_amount: "1" }, key), false);
  assert.equal(verifySignature({ ...p, signature_key: "x" }, key), false);
  assert.throws(() =>
    paymentStatus({ ...p, gross_amount: "149001" }, "pending"),
  );
  assert.throws(() => paymentStatus({ ...p, currency: "USD" }, "pending"));
});
test("status pembayaran tahan terhadap duplikat dan urutan terlambat", () => {
  assert.equal(paymentStatus(payment("settlement"), "pending"), "paid");
  assert.equal(paymentStatus(payment("pending"), "paid"), "paid");
  assert.equal(paymentStatus(payment("cancel"), "paid"), "paid");
  assert.equal(paymentStatus(payment("refund"), "paid"), "revoked");
  assert.equal(paymentStatus(payment("settlement"), "revoked"), "revoked");
  assert.equal(paymentStatus(payment("partial_refund"), "paid"), "paid");
  assert.equal(
    paymentStatus(
      { ...payment("capture"), fraud_status: "challenge" },
      "pending",
    ),
    "pending",
  );
  assert.equal(
    paymentStatus({ ...payment("capture"), fraud_status: "accept" }, "pending"),
    "paid",
  );
  for (const status of ["cancel", "deny", "failure"])
    assert.equal(paymentStatus(payment(status), "pending"), "failed");
  assert.equal(paymentStatus(payment("expire"), "pending"), "expired");
});
test("undo dan redo mengembalikan teks manual bersama pilihan visual", () => {
  let h: History = {
    past: [],
    present: { state: { lighting: "soft" }, manual: "My edited prompt" },
    future: [],
  };
  h = historyReducer(h, {
    type: "change",
    value: { ...h.present, state: { lighting: "hard" } },
  });
  assert.equal(h.present.manual, "My edited prompt");
  h = historyReducer(h, { type: "undo" });
  assert.equal(h.present.state.lighting, "soft");
  h = historyReducer(h, { type: "redo" });
  assert.equal(h.present.state.lighting, "hard");
  h = historyReducer(h, {
    type: "change",
    value: { ...h.present, manual: null },
  });
  h = historyReducer(h, { type: "undo" });
  assert.equal(h.present.manual, "My edited prompt");
});
test("sepuluh studio menghasilkan descriptor JSON tanpa fungsi premium di frontend", () => {
  assert.equal(DOMAINS.length, 10);
  for (const domain of DOMAINS) {
    const d = describeStudio(domain, {}, true);
    assert.ok(d.prompt.length > 30, domain.id);
    const json = JSON.stringify(d);
    assert.ok(!json.includes("promptPhrase"), domain.id);
    assert.ok(!json.includes("buildPrompt"), domain.id);
    assert.ok(
      d.sections.every((s) =>
        s.fields.every((f) => typeof f.visible === "boolean"),
      ),
    );
  }
});
test("input prompt dibatasi dan studio bergantung pada nilai yang valid", () => {
  const domain = DOMAINS.find((d) => d.id === "cinematic")!;
  assert.throws(() =>
    describeStudio(domain, { subjectAction: "a".repeat(6001) }),
  );
  const p = DOMAINS.find((d) => d.id === "product")!;
  assert.throws(() => describeStudio(p, { category: ["skincare"] }));
  assert.throws(() => describeStudio(p, { negativeSpace: "true" }));
  const value = describeStudio(p, {
    productName: "A ceramic coffee cup",
    lighting: "made-up-value",
  });
  assert.equal(value.state.lighting, p.createEmptyState().lighting);
  assert.ok(value.prompt.includes("ceramic coffee cup"));
  assert.ok(value.protectedKeys.includes("productName"));
});
