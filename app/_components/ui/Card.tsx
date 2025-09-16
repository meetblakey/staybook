import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/40",
        className,
      )}
      {...props}
    />
  );
}
