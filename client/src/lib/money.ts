/**
 * Money is represented everywhere in the application as integer minor units
 * ("cents") plus an ISO 4217 currency code. Never use floating point for money.
 */

export interface Money {
  /** Amount in minor units (e.g. cents). */
  readonly amount: number;
  /** ISO 4217 alphabetic code, e.g. "USD". */
  readonly currency: string;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

/** Format a Money value for display, e.g. `{ amount: 125000, currency: "USD" }` → "$1,250.00". */
export function formatMoney(money: Money): string {
  return getFormatter(money.currency).format(money.amount / 100);
}

/** Format a Money value without trailing cents when the amount is a whole major unit. */
export function formatMoneyCompact(money: Money): string {
  const isWhole = money.amount % 100 === 0;
  if (!isWhole) {
    return formatMoney(money);
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(money.amount / 100);
}

/** Add Money values of the same currency. Throws on mixed currencies. */
export function addMoney(values: readonly Money[]): Money {
  if (values.length === 0) {
    throw new Error("addMoney requires at least one value");
  }
  const first = values[0]!;
  for (const value of values) {
    if (value.currency !== first.currency) {
      throw new Error(`Cannot add mixed currencies: ${first.currency} + ${value.currency}`);
    }
  }
  return {
    amount: values.reduce((sum, value) => sum + value.amount, 0),
    currency: first.currency,
  };
}

/** Multiply a Money value by a non-negative integer quantity. */
export function multiplyMoney(money: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`Quantity must be a non-negative integer, received ${quantity}`);
  }
  return { amount: money.amount * quantity, currency: money.currency };
}
