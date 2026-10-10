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
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-standard " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-wine text-ivory border border-wine hover:bg-wine-hover active:bg-wine-active " +
    "shadow-[0_1px_0_0_rgb(36_28_32/0.15)]",
  secondary:
    "bg-ink text-ivory border border-ink hover:bg-black active:bg-black",
  outline:
    "bg-transparent text-wine border border-wine hover:bg-wine hover:text-ivory active:bg-wine-active active:border-wine-active",
  text:
    "bg-transparent text-wine border border-transparent hover:text-wine-hover underline-offset-4 hover:underline p-0",
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
