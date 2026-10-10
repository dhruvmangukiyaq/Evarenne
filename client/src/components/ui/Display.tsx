import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatMoney, formatMoneyCompact } from "../../lib/money";
import type { Money } from "../../lib/money";

/* ---------------- Badge ---------------- */

export type BadgeTone = "neutral" | "wine" | "gold" | "success" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border-ivory-dim bg-ivory-deep text-ink-soft",
  wine: "border-wine/20 bg-wine/10 text-wine",
  gold: "border-gold/40 bg-gold/15 text-gold-deep",
  success: "border-success/25 bg-success-soft text-success",
  danger: "border-danger/25 bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 font-sans text-xs font-medium tracking-wide ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------- PriceDisplay ---------------- */

export interface PriceDisplayProps {
  price: Money;
  compareAt?: Money | null;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
  className?: string;
}

const priceSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const;

export function PriceDisplay({
  price,
  compareAt,
  size = "md",
  compact = false,
  className = "",
}: PriceDisplayProps) {
  const formatter = compact ? formatMoneyCompact : formatMoney;
  const hasDiscount = compareAt != null && compareAt.amount > price.amount;

  return (
    <span className={`inline-flex items-baseline gap-2 font-sans ${priceSizes[size]} ${className}`}>
      <span className="font-medium text-ink tabular-nums">{formatter(price)}</span>
      {hasDiscount && (
        <>
          <s className="text-sm text-ink-faint tabular-nums">{formatter(compareAt)}</s>
          <span className="sr-only">reduced from {formatter(compareAt)}</span>
        </>
      )}
    </span>
  );
}

/* ---------------- Breadcrumbs ---------------- */

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, className = "" }: { items: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs text-ink-soft">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="underline-offset-4 transition-colors hover:text-wine hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-ink" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({
  className = "",
  rounded = "md",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-ivory-dim ${roundedClass} ${className}`}
    />
  );
}

/* ---------------- EmptyState ---------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 border border-dashed border-ivory-dim bg-ivory-deep/40 px-6 py-14 text-center ${className}`}
    >
      {icon && (
        <div aria-hidden="true" className="text-gold">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="max-w-prose text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------------- ErrorState ---------------- */

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 border border-danger/30 bg-danger-soft/40 px-6 py-12 text-center ${className}`}
    >
      <span aria-hidden="true" className="text-lg text-danger">
        ⚠
      </span>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="max-w-prose text-sm text-ink-soft">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 border border-wine px-5 py-2 font-sans text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
