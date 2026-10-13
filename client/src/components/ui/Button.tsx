import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const base =
  "relative inline-flex items-center justify-center gap-2 font-sans font-medium " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive";

// Fill buttons carry `anim-shrink` — they press inward to 90% on hover/focus
// (the reference site's button micro-interaction). Text buttons only recolour.
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-olive text-ivory border border-olive hover:bg-olive-hover active:bg-olive-active " +
    "shadow-[0_1px_0_0_rgb(38_40_33/0.15)] anim-shrink",
  secondary:
    "bg-charcoal text-ivory border border-charcoal hover:bg-black active:bg-black anim-shrink",
  outline:
    "bg-transparent text-olive border border-olive hover:bg-olive hover:text-ivory active:bg-olive-active active:border-olive-active " +
    "anim-shrink",
  text:
    "bg-transparent text-olive border border-transparent hover:text-olive-hover underline-offset-4 hover:underline p-0 " +
    "transition-colors duration-150 ease-standard",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-base",
};

// Text buttons keep intrinsic padding regardless of size
const textPadding: Record<ButtonSize, string> = {
  sm: "h-auto",
  md: "h-auto",
  lg: "h-auto",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    className = "",
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const sizeClass = variant === "text" ? textPadding[size] : sizes[size];
  const widthClass = fullWidth && variant !== "text" ? "w-full" : "";

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${sizeClass} ${widthClass} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {!loading && leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
