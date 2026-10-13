/**
 * WhatsApp deep link behind every "Inquire Now" control.
 *
 * The showroom number lives here once, in the E.164 shape wa.me expects
 * (digits only, country code first): +91 98798 26684. Each CTA opens a chat
 * with a message already written, so an enquiry needs no form.
 */

const WHATSAPP_NUMBER = "919879826684";

const GREETING = "Hello Evarenne,";

const GENERAL_ENQUIRY = `${GREETING} I'd like to inquire about your lab-grown diamonds.`;

/**
 * A chat link with the message pre-written. Pass the piece being enquired
 * about ("Lab-Grown Oval 1.20ct (SKU EVL-OV-120)") and the message names it,
 * so the specialist knows which stone prompted the enquiry.
 */
export function whatsappInquiryUrl(stone?: string): string {
  const message = stone
    ? `${GREETING} I'm interested in ${stone}. Could you share details and pricing?`
    : GENERAL_ENQUIRY;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
