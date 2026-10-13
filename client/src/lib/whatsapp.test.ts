import { describe, expect, it } from "vitest";
import { whatsappInquiryUrl } from "./whatsapp";

/**
 * Every "Inquire Now" control on the storefront resolves to this helper, so
 * the showroom number and the message shape are asserted here once rather
 * than on each page.
 */
describe("whatsappInquiryUrl", () => {
  it("opens a chat with the showroom number", () => {
    expect(whatsappInquiryUrl()).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=/);
    expect(whatsappInquiryUrl()).toContain("919879826684");
  });

  it("names the stone in the pre-written message", () => {
    const url = whatsappInquiryUrl("Lab-Grown Oval 1.20ct (SKU EVL-OV-120)");
    const message = decodeURIComponent(url.split("?text=")[1] ?? "");

    expect(message).toContain("Lab-Grown Oval 1.20ct");
    expect(message).toContain("EVL-OV-120");
    expect(message.startsWith("Hello Evarenne,")).toBe(true);
  });
});
