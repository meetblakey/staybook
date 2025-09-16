"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";

import { sendMessage } from "@/app/_features/messages/actions";
import { Avatar } from "@/app/_components/ui/Avatar";
import { Button } from "@/app/_components/ui/Button";
import { pushToast } from "@/app/_components/ui/Toast";

export type Thread = {
  id: string;
  status: string;
  last_message_at: string | null;
  listing: { id: string; title: string | null } | null;
  guest: { id: string; full_name: string | null; avatar_url: string | null } | null;
  host: { id: string; full_name: string | null; avatar_url: string | null } | null;
  messages: { id: string; content: string; sender_id: string; created_at: string | null }[];
};

export function MessagesPanel({ threads, currentUserId }: { threads: Thread[]; currentUserId: string }) {
  const [localThreads, setLocalThreads] = useState(threads);
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeThread = useMemo(
    () => localThreads.find((thread) => thread.id === activeThreadId) ?? localThreads[0],
    [activeThreadId, localThreads],
  );

  const sortedMessages = useMemo(() => {
    if (!activeThread) return [] as Thread["messages"];
    return [...activeThread.messages].sort((a, b) => {
      const first = a.created_at ? new Date(a.created_at).getTime() : 0;
      const second = b.created_at ? new Date(b.created_at).getTime() : 0;
      return first - second;
    });
  }, [activeThread]);

  const handleSend = () => {
    if (!activeThread || draft.trim().length === 0) return;

    startTransition(async () => {
      try {
        await sendMessage({ threadId: activeThread.id, content: draft });
        setLocalThreads((threads) =>
          threads.map((thread) =>
            thread.id === activeThread.id
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: `local-${Date.now()}`,
                      content: draft,
                      sender_id: currentUserId,
                      created_at: new Date().toISOString(),
                    },
                  ],
                  last_message_at: new Date().toISOString(),
                }
              : thread,
          ),
        );
        setDraft("");
        pushToast({ title: "Message sent", description: "Guests will see your reply instantly.", variant: "success" });
      } catch (error) {
        pushToast({ title: "Could not send message", description: (error as Error).message, variant: "error" });
      }
    });
  };

  if (localThreads.length === 0) {
    return <p className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">No messages yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <div className="space-y-3">
        {localThreads.map((thread) => {
          const counterpart = thread.host?.id === currentUserId ? thread.guest : thread.host;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveThreadId(thread.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left ${
                activeThread?.id === thread.id ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)]/10" : "border-gray-100"
              }`}
            >
              <Avatar src={counterpart?.avatar_url} alt={counterpart?.full_name ?? "Guest"} className="h-12 w-12" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{counterpart?.full_name ?? "Guest"}</p>
                <p className="text-xs text-gray-500">{thread.listing?.title ?? "Listing"}</p>
              </div>
              <div className="text-xs text-gray-400">
                {thread.last_message_at
                  ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })
                  : "--"}
              </div>
            </button>
          );
        })}
      </div>
      {activeThread ? (
        <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">{activeThread.listing?.title ?? "Conversation"}</h2>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status: {activeThread.status}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {sortedMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-xl rounded-2xl px-4 py-2 text-sm ${
                  message.sender_id === currentUserId
                    ? "ml-auto bg-[var(--color-brand-600)] text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{message.content}</p>
                <p className="mt-1 text-xs opacity-60">
                  {message.created_at
                    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
                    : "Just now"}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm"
              placeholder="Write a message"
            />
            <div className="flex justify-end">
              <Button type="button" onClick={handleSend} loading={isPending} disabled={draft.trim().length === 0}>
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
