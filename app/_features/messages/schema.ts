import { z } from "zod";

export const sendMessageSchema = z
  .object({
    threadId: z.string().uuid().optional(),
    listingId: z.string().uuid().optional(),
    hostId: z.string().uuid().optional(),
    guestId: z.string().uuid().optional(),
    content: z.string().min(1).max(2000),
  })
  .refine(
    (value) =>
      value.threadId ||
      (value.listingId && value.hostId && value.guestId && value.hostId !== value.guestId),
    {
      message: "Provide a thread ID or listing, host, and guest IDs to start a conversation.",
      path: ["threadId"],
    },
  );

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
