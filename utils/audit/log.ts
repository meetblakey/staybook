import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";

export type AuditLogPayload = {
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  meta?: Json | Record<string, unknown> | null;
};

export async function recordAuditLog(
  client: SupabaseClient<Database>,
  payload: AuditLogPayload,
): Promise<void> {
  const entry = {
    user_id: payload.userId ?? null,
    action: payload.action,
    entity: payload.entity ?? null,
    entity_id: payload.entityId ?? null,
    meta: (payload.meta ?? null) as Json | null,
  };

  const { error } = await client.from("audit_logs").insert(entry);
  if (error) {
    console.error("Failed to record audit log", error);
  }
}
