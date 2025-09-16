import { MessagesPanel } from "@/app/_components/messages/MessagesPanel";
import { Card } from "@/app/_components/ui/Card";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getUserThreads } from "@/app/_features/messages/queries";

export default async function MessagesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <Card className="text-sm text-gray-500">Sign in to view your inbox.</Card>;
  }

  const threads = await getUserThreads(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-500">Message guests and keep every conversation synced with Supabase Realtime.</p>
      </div>
      <MessagesPanel threads={threads} currentUserId={profile.id} />
    </div>
  );
}
