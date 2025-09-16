"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogIn, Menu, PlusCircle, User2 } from "lucide-react";

import type { Profile } from "@/app/_features/auth/session";
import { pushToast } from "@/app/_components/ui/Toast";
import { Avatar } from "@/app/_components/ui/Avatar";
import { Button } from "@/app/_components/ui/Button";

export function UserMenu({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggle = () => setOpen((value) => !value);

  const handleLoginRedirect = () => {
    setOpen(false);
    router.push("/auth/login");
  };

  const handleCreateListing = () => {
    if (!profile) {
      pushToast({ title: "Please sign in", description: "Hosts need to login before creating listings." });
      router.push("/auth/login?redirect=/dashboard/host/listings/new");
      return;
    }
    router.push("/dashboard/host/listings/new");
  };

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm hover:border-gray-300"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
        {profile ? <Avatar src={profile.avatar_url} alt={profile.full_name ?? "Your avatar"} /> : <User2 className="h-4 w-4" />}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-60 rounded-3xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/40">
          {profile ? (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <Avatar src={profile.avatar_url} alt={profile.full_name ?? "Your avatar"} className="h-12 w-12" />
                <div>
                  <p className="font-semibold text-gray-900">{profile.full_name ?? "Guest"}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{profile.role}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/dashboard/trips" className="rounded-xl px-3 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Trips
                </Link>
                <Link href="/dashboard/wishlists" className="rounded-xl px-3 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Wishlists
                </Link>
                <Link href="/dashboard/messages" className="rounded-xl px-3 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Messages
                </Link>
                <Link href="/dashboard/host" className="rounded-xl px-3 py-2 hover:bg-gray-100" onClick={() => setOpen(false)}>
                  Host dashboard
                </Link>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <Button variant="ghost" size="sm" className="w-full justify-center" onClick={handleCreateListing}>
                  <PlusCircle className="h-4 w-4" /> Become a host
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <p className="text-sm font-semibold text-gray-900">Welcome to Staybook</p>
              <Button variant="brand" size="md" className="w-full justify-center" onClick={handleLoginRedirect}>
                <LogIn className="h-4 w-4" /> Sign in
              </Button>
              <button
                type="button"
                onClick={handleCreateListing}
                className="w-full rounded-xl px-3 py-2 text-center text-sm font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-600)]/10"
              >
                List your home
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
