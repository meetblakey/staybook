import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function getUserThreads(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("threads")
    .select(
      `id, status, last_message_at, listing:listings(id,title,city,country), guest:profiles!threads_guest_id_fkey(id,full_name,avatar_url), host:profiles!threads_host_id_fkey(id,full_name,avatar_url), messages:messages(id,content,sender_id,created_at)`,
    )
    .or(`guest_id.eq.${userId},host_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Failed to load threads", error);
    return [];
  }

  return data ?? [];
}
