import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, formatMoneyCompact, multiplyMoney } from "./money";

describe("formatMoney", () => {
  it("formats USD minor units", () => {
    expect(formatMoney({ amount: 125000, currency: "USD" })).toBe("$1,250.00");
  });

  it("formats zero", () => {
    expect(formatMoney({ amount: 0, currency: "USD" })).toBe("$0.00");
  });

  it("formats sub-unit amounts", () => {
    expect(formatMoney({ amount: 5, currency: "USD" })).toBe("$0.05");
  });

  it("handles negative adjustments (e.g. discounts)", () => {
    expect(formatMoney({ amount: -2500, currency: "USD" })).toBe("-$25.00");
  });
});

describe("formatMoneyCompact", () => {
  it("drops cents for whole amounts", () => {
    expect(formatMoneyCompact({ amount: 125000, currency: "USD" })).toBe("$1,250");
  });

  it("keeps cents when not whole", () => {
    expect(formatMoneyCompact({ amount: 125099, currency: "USD" })).toBe("$1,250.99");
  });
});

describe("addMoney", () => {
  it("sums same-currency values", () => {
    expect(addMoney([{ amount: 1000, currency: "USD" }, { amount: 2500, currency: "USD" }])).toEqual({
      amount: 3500,
      currency: "USD",
    });
  });

  it("rejects mixed currencies", () => {
    expect(() => addMoney([{ amount: 1000, currency: "USD" }, { amount: 1, currency: "EUR" }])).toThrow(
      /mixed currencies/,
    );
  });

  it("rejects empty input", () => {
    expect(() => addMoney([])).toThrow(/at least one/);
  });
});

describe("multiplyMoney", () => {
  it("multiplies by integer quantity", () => {
    expect(multiplyMoney({ amount: 4999, currency: "USD" }, 3)).toEqual({
      amount: 14997,
      currency: "USD",
    });
  });

  it("rejects fractional quantities", () => {
    expect(() => multiplyMoney({ amount: 100, currency: "USD" }, 1.5)).toThrow(/integer/);
  });

  it("rejects negative quantities", () => {
    expect(() => multiplyMoney({ amount: 100, currency: "USD" }, -1)).toThrow(/non-negative/);
  });
});
