import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-[var(--color-brand-600)] bg-[var(--color-brand-600)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-brand-600)]",
        className,
      )}
      {...props}
    />
  );
}
