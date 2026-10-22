ALTER TABLE aichemy_orders ADD CONSTRAINT orders_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE aichemy_entitlements ADD CONSTRAINT entitlements_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE aichemy_library ADD CONSTRAINT library_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
--> statement-breakpoint
CREATE INDEX library_owner_kind ON aichemy_library(user_id,kind,updated_at);
--> statement-breakpoint
CREATE UNIQUE INDEX custom_studio_owner ON aichemy_library(user_id,studio_id) WHERE kind='studio';
--> statement-breakpoint
CREATE INDEX orders_owner_environment ON aichemy_orders(user_id,environment,created_at);
--> statement-breakpoint
ALTER TABLE aichemy_orders ADD CONSTRAINT order_amount CHECK(amount=149000);
--> statement-breakpoint
ALTER TABLE aichemy_orders ADD CONSTRAINT order_environment CHECK(environment IN ('sandbox','production'));
--> statement-breakpoint
ALTER TABLE aichemy_entitlements ADD CONSTRAINT entitlement_environment CHECK(environment IN ('sandbox','production'));
