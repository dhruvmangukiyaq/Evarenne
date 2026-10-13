import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Select, Textarea, Checkbox } from "../components/ui/Form";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { useToast } from "../components/ui/toast-context";

/**
 * Appointment request form.
 *
 * This is a REQUEST, not a confirmed booking. There is no calendar or CRM
 * integration connected in this preview, so nothing is persisted and no
 * confirmation is claimed beyond acknowledging the submission locally. The
 * server-side handler (Phase 10 backend) is where this will POST once an
 * endpoint exists.
 */

interface FormState {
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string;
  time: string;
  timezone: string;
  topic: string;
  notes: string;
  consent: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!state.name.trim()) errors.name = "Please enter your name.";
  if (!state.email.trim()) errors.email = "Please enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = "Please enter a valid email address.";
  if (!state.type) errors.type = "Please choose a consultation type.";
  if (!state.date) errors.date = "Please choose a preferred date.";
  if (!state.topic) errors.topic = "Please choose a topic.";
  if (!state.consent) errors.consent = "Please confirm you'd like us to contact you about this request.";
  return errors;
}

const TIME_OPTIONS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
];

export function AppointmentPage() {
  const { toast } = useToast();
  // Product context carried over from a diamond's "Inquire Now" button, so the
  // form already knows which stone prompted the enquiry.
  const [searchParams] = useSearchParams();
  const productName = searchParams.get("product");
  const productSku = searchParams.get("sku");
  const productNote = productName
    ? `I'm interested in ${productName}${productSku ? ` (SKU ${productSku})` : ""}.`
    : "";
  const [state, setState] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    type: "",
    date: "",
    time: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    topic: productName ? "diamond" : "",
    notes: productNote,
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    // Clear the specific error as soon as the user corrects it
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(state);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast("Please correct the highlighted fields.", "error");
      // Move focus to the first invalid field for keyboard/screen-reader users
      const firstKey = Object.keys(found)[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.focus();
      return;
    }
    // No backend endpoint is connected in this preview, so we acknowledge the
    // request locally and state clearly that it is not yet a confirmed booking.
    setSubmitted(true);
    toast("Your request has been recorded locally (preview).", "success");
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-20 lg:px-8">
        <Reveal delay={100} variant="soft">
          <div className="mx-auto max-w-xl border border-ivory-dim bg-ivory-deep p-10 text-center">
            <p className="text-eyebrow text-champagne-deep">Request received</p>
            <h1 className="mt-2 font-display text-h1 text-charcoal">Thank you, {state.name.split(" ")[0]}</h1>
            <p className="mt-4 text-body-lg text-charcoal-soft">
              Your consultation request has been noted. This preview isn't connected to a scheduling
              system yet, so nothing is booked and you won't receive a confirmation email.
            </p>
            <p className="mt-3 text-sm text-charcoal-soft">
              Once scheduling is connected, you'll receive a confirmation by email with the appointment
              details and how to reschedule.
            </p>
            <Button
              className="mt-8"
              onClick={() => {
                setSubmitted(false);
                // Clears the answers but keeps the stone the visitor came from.
                setState((s) => ({
                  ...s,
                  name: "",
                  email: "",
                  phone: "",
                  type: "",
                  date: "",
                  time: "",
                  topic: productName ? "diamond" : "",
                  notes: productNote,
                  consent: false,
                }));
              }}
            >
              Submit another request
            </Button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-lg) px-4 py-12 lg:px-8">
      <Reveal delay={100}>
        <p className="text-eyebrow text-champagne-deep">Client care</p>
        <h1 className="mt-2 font-display text-h1 text-charcoal">Inquire Now</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-charcoal-soft">
          Meet with a diamond specialist in person or over video. Tell us what you're looking for and
          we'll prepare so your time is well spent. Submitting this form is a request — we'll confirm
          the exact time with you directly.
        </p>
        {productName && (
          <p className="mt-4 inline-flex border border-olive/30 bg-olive/10 px-3 py-1.5 font-sans text-sm text-olive">
            Enquiring about {productName}
            {productSku ? ` · SKU ${productSku}` : ""}
          </p>
        )}
      </Reveal>

      <form onSubmit={onSubmit} noValidate className="mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        <Input
          label="Full name"
          name="name"
          required
          value={state.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={state.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          value={state.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Select
          label="Consultation type"
          name="type"
          required
          placeholder="Choose one"
          value={state.type}
          onChange={(e) => update("type", e.target.value)}
          error={errors.type}
          options={[
            { value: "in-store", label: "In-store visit" },
            { value: "video", label: "Video consultation" },
            { value: "phone", label: "Phone call" },
          ]}
        />
        <Input
          label="Preferred date"
          name="date"
          type="date"
          required
          value={state.date}
          onChange={(e) => update("date", e.target.value)}
          error={errors.date}
        />
        <Select
          label="Preferred time (optional)"
          name="time"
          placeholder="Choose a time"
          value={state.time}
          onChange={(e) => update("time", e.target.value)}
          options={TIME_OPTIONS}
        />
        <Input
          label="Your timezone"
          name="timezone"
          hint="Detected automatically — change if needed."
          value={state.timezone}
          onChange={(e) => update("timezone", e.target.value)}
        />
        <Select
          label="Topic"
          name="topic"
          required
          placeholder="Choose one"
          value={state.topic}
          onChange={(e) => update("topic", e.target.value)}
          error={errors.topic}
          options={[
            { value: "diamond", label: "Choosing a loose diamond" },
            { value: "education", label: "Understanding the 4Cs" },
            { value: "compare", label: "Comparing two stones" },
            { value: "report", label: "Grading reports" },
            { value: "other", label: "Something else" },
          ]}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Anything we should prepare? (optional)"
            name="notes"
            rows={5}
            placeholder="Budget, timeline, shapes or styles you like, questions you'd like answered…"
            value={state.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Checkbox
            name="consent"
            label="I agree to be contacted about this appointment request."
            hint="We'll only use your details to arrange this consultation. See our privacy policy."
            checked={state.consent}
            onChange={(e) => update("consent", e.target.checked)}
          />
          {errors.consent && (
            <p role="alert" className="mt-1.5 text-xs text-danger">
              {errors.consent}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Button type="submit" size="lg">
            Submit request
          </Button>
          <p className="mt-3 text-xs text-charcoal-soft">
            This is a request, not a confirmed booking. We'll follow up to confirm the exact time. Your
            details aren't stored in this preview.
          </p>
        </div>
      </form>
    </div>
  );
}
