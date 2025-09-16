import Image from "next/image";
import clsx from "clsx";

export function Avatar({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className={clsx("h-10 w-10 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        "flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-600)]/10 text-sm font-semibold uppercase text-[var(--color-brand-700)]",
        className,
      )}
    >
      {alt?.[0] ?? "?"}
    </div>
  );
}
