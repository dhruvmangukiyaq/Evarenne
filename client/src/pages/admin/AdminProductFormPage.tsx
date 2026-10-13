import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  adminApi,
  uploadContentType,
} from "../../lib/admin-api";
import { useApi } from "../../lib/useApi";
import { shapeLabel } from "../../lib/labels";
import type { AdminProductInput, DiamondShape, DiamondType, Product } from "../../lib/api-types";
import { Button } from "../../components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "../../components/ui/Form";
import { ErrorState, Skeleton } from "../../components/ui/Display";
import { useToast } from "../../components/ui/toast-context";

/* ---------------- grading vocabulary ---------------- */

/**
 * The standard lab scales offered by the form. These are fixed vocabularies,
 * not values this app makes up: the stone's actual grade is chosen by whoever
 * holds the grading report, and nothing is pre-selected.
 */
const CUTS = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];
const POLISHES = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const SYMMETRIES = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const FLUORESCENCE = ["None", "Faint", "Medium", "Strong", "Very Strong"];
const SHAPES: DiamondShape[] = [
  "round",
  "oval",
  "princess",
  "emerald",
  "cushion",
  "pear",
  "radiant",
  "asscher",
  "marquise",
  "heart",
];

function options(values: readonly string[]): Array<{ value: string; label: string }> {
  return values.map((value) => ({ value, label: value }));
}

/**
 * Keeps a stored grade visible even if it falls outside today's list (a lab
 * wording we haven't added yet): showing what the data says beats silently
 * swapping it for the first option.
 */
function withValue(
  values: readonly string[],
  current: string,
): Array<{ value: string; label: string }> {
  const list = options(values);
  if (current && !values.includes(current)) list.unshift({ value: current, label: current });
  return list;
}

/* ---------------- form state ---------------- */

interface FormState {
  name: string;
  description: string;
  diamondType: DiamondType;
  shape: DiamondShape | "";
  featured: boolean;
  /** Uploaded storage paths, in display order. */
  images: string[];
  video: string | null;
  carat: string;
  cut: string;
  color: string;
  clarity: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  measurements: string;
  lab: string;
  certificateNumber: string;
  certificateUrl: string;
  slug: string;
  sku: string;
}

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    diamondType: "natural",
    shape: "",
    featured: false,
    images: [],
    video: null,
    carat: "",
    cut: "",
    color: "",
    clarity: "",
    polish: "",
    symmetry: "",
    fluorescence: "",
    measurements: "",
    lab: "",
    certificateNumber: "",
    certificateUrl: "",
    slug: "",
    sku: "",
  };
}

function fromProduct(product: Product): FormState {
  const specs = product.specs;
  return {
    name: product.name,
    description: product.description,
    diamondType: product.diamondType ?? "natural",
    shape: product.shape ?? "",
    featured: product.featured === true,
    images: product.images.map((image) => image.src),
    video: product.video ?? null,
    carat: specs ? String(specs.carat) : "",
    cut: specs?.cut ?? "",
    color: specs?.color ?? "",
    clarity: specs?.clarity ?? "",
    polish: specs?.polish ?? "",
    symmetry: specs?.symmetry ?? "",
    fluorescence: specs?.fluorescence ?? "",
    measurements: specs?.measurements ?? "",
    lab: specs?.lab ?? "",
    certificateNumber: specs?.certificateNumber ?? "",
    certificateUrl: specs?.certificateUrl ?? "",
    slug: product.slug,
    sku: product.sku,
  };
}

const MB = 1024 * 1024;

/* ---------------- page ---------------- */

/** Route entry: loads an existing diamond when editing, then mounts the form. */
export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useApi<Product | null>((signal) => {
    if (!id) return Promise.resolve(null);
    void signal;
    return adminApi.product(id).then((response) => response.product);
  }, [id]);

  if (id && loading) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-10 lg:px-8" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-6 h-80 w-full" />
      </div>
    );
  }

  if (id && error) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <ErrorState
          title={error.status === 404 ? "That diamond no longer exists" : "We couldn't load it"}
          description={error.message}
          onRetry={id && error.status !== 404 ? refetch : undefined}
        />
        <div className="mt-6 text-center">
          <Link
            to="/admin/products"
            className="font-sans text-sm font-medium text-olive underline-offset-4 hover:underline"
          >
            ← Back to diamonds
          </Link>
        </div>
      </div>
    );
  }

  return <ProductForm key={id ?? "new"} initial={data} />;
}

function ProductForm({ initial }: { initial: Product | null }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<FormState>(() =>
    initial ? fromProduct(initial) : emptyForm(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const isEdit = initial !== null;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  /* ---- uploads ---- */

  /**
   * Validates and uploads one file, returning its storage path (or null when
   * it was rejected). Every failure is reported inline *and* as a toast, so a
   * rejected file can't vanish silently.
   */
  async function uploadOne(file: File, kind: "image" | "video"): Promise<string | null> {
    const accepted = kind === "image" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;
    const limit = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

    const contentType = uploadContentType(file);
    if (!contentType || !accepted.some((type) => type === contentType)) {
      const message = `“${file.name}” isn't a supported ${kind} — use ${
        kind === "image" ? "JPEG, PNG, WebP or AVIF" : "MP4 or WebM"
      }.`;
      setMediaError(message);
      toast(message, "error");
      return null;
    }
    if (file.size > limit) {
      const message = `“${file.name}” is ${(file.size / MB).toFixed(1)} MB — the limit is ${Math.floor(
        limit / MB,
      )} MB.`;
      setMediaError(message);
      toast(message, "error");
      return null;
    }

    setMediaError(null);
    setUploads((count) => count + 1);
    try {
      const { url } = await adminApi.upload(file);
      return url;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : `“${file.name}” couldn't be uploaded.`;
      setMediaError(message);
      toast(message, "error");
      return null;
    } finally {
      setUploads((count) => count - 1);
    }
  }

  async function onImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow re-picking the same file after a remove
    if (files.length === 0) return;

    // Sequential: each upload is awaited, so the thumbnails always appear in
    // the order the owner chose them in. State is updated functionally inside
    // the loop — `state` would be stale by the second file.
    for (const file of files) {
      const url = await uploadOne(file, "image");
      if (url) {
        setState((current) => ({ ...current, images: [...current.images, url] }));
      }
    }
  }

  async function onVideoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadOne(file, "video");
    if (url) set("video", url);
  }

  function removeImage(src: string) {
    set(
      "images",
      state.images.filter((image) => image !== src),
    );
  }

  /* ---- submit ---- */

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state.shape) {
      setFieldErrors({ shape: "Choose a shape." });
      setFormError("Choose a shape before saving.");
      return;
    }

    const carat = Number(state.carat);
    if (!Number.isFinite(carat) || carat <= 0) {
      setFieldErrors({ "specs.carat": "Enter the carat weight, e.g. 1.05." });
      setFormError("Enter the carat weight.");
      return;
    }

    const name = state.name.trim();
    const input: AdminProductInput = {
      name,
      description: state.description.trim(),
      diamondType: state.diamondType,
      shape: state.shape,
      specs: {
        carat,
        cut: state.cut,
        color: state.color,
        clarity: state.clarity,
        polish: state.polish,
        symmetry: state.symmetry,
        fluorescence: state.fluorescence,
        measurements: state.measurements.trim(),
        lab: state.lab.trim() || null,
        certificateNumber: state.certificateNumber.trim().toUpperCase() || null,
        certificateUrl: state.certificateUrl.trim() || null,
      },
      // Alt text is rebuilt from the current name on every save, so renaming a
      // stone never leaves stale descriptions on its photographs.
      images: state.images.map((src, index) => ({
        src,
        alt: `${name || "Diamond"} — photograph ${index + 1}`,
      })),
      video: state.video,
      featured: state.featured,
    };

    // Only send slug/sku when they actually changed: an untouched slug is a
    // link other people already hold, and the server keeps it as-is otherwise.
    if (state.slug && state.slug !== (initial?.slug ?? "")) input.slug = state.slug.trim();
    if (state.sku && state.sku !== (initial?.sku ?? "")) input.sku = state.sku.trim().toUpperCase();

    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      if (initial) {
        await adminApi.update(initial.id, input);
        toast(`“${name}” updated.`, "success");
      } else {
        await adminApi.create(input);
        toast(`“${name}” added to the catalogue.`, "success");
      }
      navigate("/admin/products", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped: Record<string, string> = {};
        for (const issue of err.issues) mapped[issue.path] = issue.message;
        setFieldErrors(mapped);
        setFormError(err.message);
      } else {
        setFormError("Something went wrong while saving. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const errorFor = (path: string) => fieldErrors[path];

  /* ---------------- render ---------------- */

  return (
    <div className="mx-auto max-w-(--container-lg) px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs tracking-[0.18em] text-charcoal-faint uppercase">
            {isEdit ? "Edit diamond" : "New diamond"}
          </p>
          <h1 className="mt-1 font-display text-h2 text-charcoal">
            {isEdit ? initial?.name : "Add a diamond"}
          </h1>
        </div>
        <Link
          to="/admin/products"
          className="font-sans text-sm text-charcoal-soft underline-offset-4 transition-colors hover:text-olive hover:underline"
        >
          ← Back to diamonds
        </Link>
      </div>

      <form onSubmit={(event) => void onSubmit(event)} className="mt-8 flex flex-col gap-10">
        {formError && (
          <p
            role="alert"
            className="border border-danger/30 bg-danger-soft/50 p-4 text-sm text-danger"
          >
            {formError}
          </p>
        )}

        {/* ---- identification ---- */}
        <section className="flex flex-col gap-5">
          <h2 className="border-b border-ivory-dim pb-2 font-display text-h3 text-charcoal">
            The stone
          </h2>

          <Input
            label="Name"
            required
            value={state.name}
            onChange={(event) => set("name", event.target.value)}
            error={errorFor("name")}
            placeholder="Natural Oval Brilliant 1.50ct VVS1"
            hint="How the piece reads in the catalogue and on its own page."
            disabled={submitting}
          />

          <Textarea
            label="Description"
            required
            rows={5}
            value={state.description}
            onChange={(event) => set("description", event.target.value)}
            error={errorFor("description")}
            placeholder="Describe the stone: character, condition, why it stands out."
            hint="Written for visitors. No prices — this catalogue is view-only."
            disabled={submitting}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Diamond type"
              required
              value={state.diamondType}
              onChange={(event) => set("diamondType", event.target.value as DiamondType)}
              options={[
                { value: "natural", label: "Natural" },
                { value: "lab-grown", label: "Lab-grown" },
              ]}
              disabled={submitting}
            />
            <Select
              label="Shape"
              required
              placeholder="Choose a shape"
              value={state.shape}
              onChange={(event) => set("shape", event.target.value as DiamondShape | "")}
              options={SHAPES.map((shape) => ({ value: shape, label: shapeLabel(shape) }))}
              error={errorFor("shape")}
              disabled={submitting}
            />
          </div>

          <Checkbox
            label="Feature on the homepage"
            hint="Adds this stone to the featured rail visitors see first."
            checked={state.featured}
            onChange={(event) => set("featured", event.target.checked)}
            disabled={submitting}
          />
        </section>

        {/* ---- photographs & video ---- */}
        <section className="flex flex-col gap-5">
          <h2 className="border-b border-ivory-dim pb-2 font-display text-h3 text-charcoal">
            Photographs &amp; video
          </h2>

          <div>
            <p className="font-sans text-sm font-medium text-charcoal">Photographs</p>
            <p className="mt-1 text-xs text-charcoal-soft">
              JPEG, PNG, WebP or AVIF up to {MAX_IMAGE_BYTES / MB} MB each. The first photograph is
              used as the catalogue card image.
            </p>

            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {state.images.map((src, index) => (
                <li
                  key={src}
                  className="group relative aspect-square overflow-hidden border border-ivory-dim bg-ivory-deep"
                >
                  <img
                    src={src}
                    alt={`Photograph ${index + 1} of ${state.name || "this diamond"}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(src)}
                    disabled={submitting || uploads > 0}
                    aria-label={`Remove photograph ${index + 1}`}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center bg-white/90 text-sm text-charcoal transition-colors hover:bg-danger hover:text-white disabled:opacity-50"
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 bg-white/90 px-1.5 py-0.5 font-sans text-[10px] tracking-wide text-charcoal-soft uppercase">
                      Cover
                    </span>
                  )}
                </li>
              ))}

              {Array.from({ length: uploads }).map((_, index) => (
                <li
                  key={`uploading-${index}`}
                  className="flex aspect-square items-center justify-center border border-dashed border-olive/50 bg-olive/[0.04] p-2 text-center font-sans text-xs text-olive"
                  aria-live="polite"
                >
                  Uploading…
                </li>
              ))}
            </ul>

            <label className="mt-3 inline-flex h-10 w-fit cursor-pointer items-center border border-olive px-4 font-sans text-sm font-medium text-olive transition-colors hover:bg-olive hover:text-ivory focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-olive">
              Choose photographs
              <input
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={(event) => void onImageFiles(event)}
                disabled={submitting}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <p className="font-sans text-sm font-medium text-charcoal">Video</p>
            <p className="mt-1 text-xs text-charcoal-soft">
              MP4 or WebM up to {MAX_VIDEO_BYTES / MB} MB. Optional — a short clip of the stone
              turning in the light.
            </p>

            {state.video && (
              <div className="mt-3 flex items-start gap-3 border border-ivory-dim bg-white p-3">
                <video
                  src={state.video}
                  preload="metadata"
                  controls
                  className="h-28 w-40 shrink-0 bg-charcoal object-contain"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-charcoal-soft">Uploaded video.</p>
                  <button
                    type="button"
                    onClick={() => set("video", null)}
                    disabled={submitting || uploads > 0}
                    className="w-fit border border-ivory-dim px-3 py-1.5 font-sans text-sm text-charcoal-soft transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    Remove video
                  </button>
                </div>
              </div>
            )}

            <label className="mt-3 inline-flex h-10 w-fit cursor-pointer items-center border border-olive px-4 font-sans text-sm font-medium text-olive transition-colors hover:bg-olive hover:text-ivory focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-olive">
              {state.video ? "Replace video" : "Choose a video"}
              <input
                type="file"
                accept={ACCEPTED_VIDEO_TYPES.join(",")}
                onChange={(event) => void onVideoFile(event)}
                disabled={submitting}
                className="sr-only"
              />
            </label>
          </div>

          {(mediaError || errorFor("images.0.src") || errorFor("video")) && (
            <p role="alert" className="text-sm text-danger">
              {mediaError ?? errorFor("images.0.src") ?? errorFor("video")}
            </p>
          )}

          <p className="text-xs text-charcoal-faint">
            Photographs and video are stored privately on the site's own media server and served
            from there — nothing is pulled from third-party hosts.
          </p>
        </section>

        {/* ---- grading ---- */}
        <section className="flex flex-col gap-5">
          <h2 className="border-b border-ivory-dim pb-2 font-display text-h3 text-charcoal">
            Grading details
          </h2>
          <p className="-mt-2 text-xs text-charcoal-soft">
            Enter the grades exactly as they appear on the stone's report. Nothing here is
            pre-selected.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Carat"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={state.carat}
              onChange={(event) => set("carat", event.target.value)}
              error={errorFor("specs.carat")}
              placeholder="1.50"
              disabled={submitting}
            />
            <Select
              label="Cut"
              required
              placeholder="Select grade"
              value={state.cut}
              onChange={(event) => set("cut", event.target.value)}
              options={withValue(CUTS, state.cut)}
              error={errorFor("specs.cut")}
              disabled={submitting}
            />
            <Select
              label="Colour"
              required
              placeholder="Select grade"
              value={state.color}
              onChange={(event) => set("color", event.target.value)}
              options={withValue(COLORS, state.color)}
              error={errorFor("specs.color")}
              disabled={submitting}
            />
            <Select
              label="Clarity"
              required
              placeholder="Select grade"
              value={state.clarity}
              onChange={(event) => set("clarity", event.target.value)}
              options={withValue(CLARITIES, state.clarity)}
              error={errorFor("specs.clarity")}
              disabled={submitting}
            />
            <Select
              label="Polish"
              required
              placeholder="Select grade"
              value={state.polish}
              onChange={(event) => set("polish", event.target.value)}
              options={withValue(POLISHES, state.polish)}
              error={errorFor("specs.polish")}
              disabled={submitting}
            />
            <Select
              label="Symmetry"
              required
              placeholder="Select grade"
              value={state.symmetry}
              onChange={(event) => set("symmetry", event.target.value)}
              options={withValue(SYMMETRIES, state.symmetry)}
              error={errorFor("specs.symmetry")}
              disabled={submitting}
            />
            <Select
              label="Fluorescence"
              required
              placeholder="Select grade"
              value={state.fluorescence}
              onChange={(event) => set("fluorescence", event.target.value)}
              options={withValue(FLUORESCENCE, state.fluorescence)}
              error={errorFor("specs.fluorescence")}
              disabled={submitting}
            />
            <Input
              label="Measurements"
              required
              value={state.measurements}
              onChange={(event) => set("measurements", event.target.value)}
              error={errorFor("specs.measurements")}
              placeholder="7.60 × 5.40 × 3.60"
              hint="Length × width × depth, in millimetres."
              disabled={submitting}
            />
          </div>
        </section>

        {/* ---- lab report ---- */}
        <section className="flex flex-col gap-5">
          <h2 className="border-b border-ivory-dim pb-2 font-display text-h3 text-charcoal">
            Lab report
          </h2>
          <p className="-mt-2 text-xs text-charcoal-soft">
            Optional. Leave these blank unless a real, verifiable report exists — the public page
            says "not linked yet" rather than inventing one.
          </p>

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Laboratory"
              value={state.lab}
              onChange={(event) => set("lab", event.target.value)}
              error={errorFor("specs.lab")}
              placeholder="GIA"
              disabled={submitting}
            />
            <Input
              label="Report number"
              value={state.certificateNumber}
              onChange={(event) => set("certificateNumber", event.target.value)}
              error={errorFor("specs.certificateNumber")}
              placeholder="2214887766"
              hint="6–32 characters: A–Z, 0–9, hyphen."
              disabled={submitting}
            />
            <Input
              label="Report link"
              type="url"
              value={state.certificateUrl}
              onChange={(event) => set("certificateUrl", event.target.value)}
              error={errorFor("specs.certificateUrl")}
              placeholder="https://…"
              disabled={submitting}
            />
          </div>
        </section>

        {/* ---- listing ---- */}
        <section className="flex flex-col gap-5">
          <h2 className="border-b border-ivory-dim pb-2 font-display text-h3 text-charcoal">
            Listing
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="URL slug"
              value={state.slug}
              onChange={(event) => set("slug", event.target.value)}
              error={errorFor("slug")}
              placeholder={isEdit ? initial?.slug : "generated from the name"}
              hint={
                isEdit
                  ? "Shown as /products/… — leave unchanged to keep existing links working."
                  : "Optional. Leave blank to generate one from the name."
              }
              disabled={submitting}
            />
            <Input
              label="SKU"
              value={state.sku}
              onChange={(event) => set("sku", event.target.value)}
              error={errorFor("sku")}
              placeholder={isEdit ? initial?.sku : "EVN-XX-000"}
              hint={
                isEdit
                  ? "Optional — change only if this stone's code is wrong."
                  : "Optional. Leave blank to generate one."
              }
              disabled={submitting}
            />
          </div>

          {initial && (
            <p className="text-xs text-charcoal-faint">
              Public page:{" "}
              <Link
                to={`/products/${initial.slug}`}
                className="text-olive underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                /products/{initial.slug} ↗
              </Link>
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-ivory-dim pt-6">
          <Button type="submit" loading={submitting} disabled={uploads > 0}>
            {uploads > 0
              ? "Waiting for uploads…"
              : isEdit
                ? "Save changes"
                : "Add to catalogue"}
          </Button>
          <Link
            to="/admin/products"
            className="font-sans text-sm text-charcoal-soft underline-offset-4 transition-colors hover:text-olive hover:underline"
          >
            Cancel
          </Link>
          <p className="ml-auto text-xs text-charcoal-faint">
            Saved diamonds appear in the public catalogue immediately.
          </p>
        </div>
      </form>
    </div>
  );
}
