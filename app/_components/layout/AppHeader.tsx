import Link from "next/link";

import { getCurrentProfile } from "@/app/_features/auth/session";
import { SearchBar } from "@/app/_components/search/SearchBar";
import { UserMenu } from "@/app/_components/layout/UserMenu";

export async function AppHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-[var(--color-brand-700)]">
              staybook
            </Link>
            <span className="hidden text-xs font-semibold uppercase tracking-widest text-gray-400 sm:inline">
              Homes &amp; Stays
            </span>
          </div>
          <div className="hidden flex-1 md:block">
            <SearchBar variant="compact" />
          </div>
          <UserMenu profile={profile} />
        </div>
        <div className="md:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
