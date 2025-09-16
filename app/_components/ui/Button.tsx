import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "brand" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantStyles: Record<ButtonVariant, string> = {
  brand:
    "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] focus-visible:outline-[var(--color-brand-600)]",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:outline-gray-400",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "brand", size = "md", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className, {
          "cursor-not-allowed opacity-60": disabled || loading,
        })}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
