import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
export const orders = pgTable("aichemy_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  environment: text("environment").notNull(),
  status: text("status").notNull().default("created"),
  checkoutUrl: text("checkout_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const entitlements = pgTable(
  "aichemy_entitlements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    environment: text("environment").notNull(),
    orderId: text("order_id"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("entitlement_user_environment").on(
      table.userId,
      table.environment,
    ),
  ],
);
export const library = pgTable("aichemy_library", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  studioId: text("studio_id").notNull(),
  name: text("name").notNull(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const paymentEvents = pgTable("aichemy_payment_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const audit = pgTable("aichemy_audit", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
