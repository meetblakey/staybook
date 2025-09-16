import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-full bg-gray-200", className)} />;
}
