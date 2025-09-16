"use server";

import { revalidatePath } from "next/cache";

import { sendMessageSchema, type SendMessageInput } from "@/app/_features/messages/schema";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function sendMessage(input: SendMessageInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to send messages.");
  }

  const payload = sendMessageSchema.parse(input);

  let threadId = payload.threadId ?? null;

  if (!threadId) {
    const listingId = payload.listingId!;
    const hostId = payload.hostId!;
    const guestId = payload.guestId!;

    const { data: thread, error: createThreadError } = await supabase
      .from("threads")
      .upsert(
        {
          listing_id: listingId,
          host_id: hostId,
          guest_id: guestId,
        },
        { onConflict: "guest_id,host_id,listing_id" },
      )
      .select("id")
      .single();

    if (createThreadError || !thread) {
      console.error("Failed to create thread", createThreadError);
      throw new Error("Could not start conversation.");
    }

    threadId = thread.id;
  }

  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: user.id,
    content: payload.content,
  });

  if (error) {
    console.error("Failed to send message", error);
    throw new Error("Could not send message.");
  }

  await supabase.from("threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);

  revalidatePath("/dashboard/messages");

  return { threadId };
}
