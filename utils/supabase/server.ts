import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const getRequiredEnvVar = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

type CookieStoreLike = Awaited<ReturnType<typeof cookies>> & {
  set?: (options: { name: string; value: string } & CookieOptions) => void;
  delete?: (options: { name: string } & CookieOptions) => void;
};

export const createSupabaseServerClient = async (
  cookieStoreParam?: CookieStoreLike,
): Promise<SupabaseClient<Database>> => {
  const cookieStore = cookieStoreParam ?? (await cookies());

  return createServerClient<Database>(
    getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set?.({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete?.({ name, ...options });
        },
      },
    },
  );
};
