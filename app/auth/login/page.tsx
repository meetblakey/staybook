import { Suspense } from "react";

import { signIn } from "@/app/_features/auth/actions";

function LoginForm({ redirectTo, errorMessage }: { redirectTo?: string; errorMessage?: string }) {
  return (
    <form action={signIn} className="mx-auto grid w-full max-w-md gap-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in with your Supabase auth credentials.</p>
      </div>
      {errorMessage ? (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      ) : null}
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)]/30"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)]/30"
        />
      </div>
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <button
        type="submit"
        className="mt-2 rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-700)]"
      >
        Sign in
      </button>
    </form>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const redirectTo = typeof resolvedParams.redirect === "string" ? resolvedParams.redirect : undefined;
  const errorMessage = typeof resolvedParams.error === "string" ? resolvedParams.error : undefined;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<div className="h-48 w-full max-w-md animate-pulse rounded-3xl bg-gray-100" />}>
        <LoginForm redirectTo={redirectTo} errorMessage={errorMessage} />
      </Suspense>
    </div>
  );
}
