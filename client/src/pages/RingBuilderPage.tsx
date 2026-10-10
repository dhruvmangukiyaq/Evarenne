import { useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { CatalogResponse, DiamondShape } from "../lib/api-types";
import { DiamondArt } from "../components/catalog/ProductArt";
import { shapeLabel } from "../lib/labels";
import { metalLabel, styleLabel } from "../lib/labels";
import { Badge, ErrorState, PriceDisplay, Skeleton } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { useCart } from "../store/cart";
import { useToast } from "../components/ui/toast-context";
import { addMoney, formatMoney } from "../lib/money";

/**
 * "Create Your Own Ring" — a guided stepper.
 *
 * Selections persist in the URL (setting, diamond, step) so the journey
 * survives refresh and is shareable. Compatibility rules are enforced both
 * here and again on the server at quote time.
 */

type Step = "path" | "setting" | "diamond" | "review";

const STEP_ORDER: Step[] = ["path", "setting", "diamond", "review"];
const STEP_LABELS: Record<Step, string> = {
  path: "Starting point",
  setting: "Setting",
  diamond: "Diamond",
  review: "Review",
};

function Stepper({ current, onJump }: { current: Step; onJump: (step: Step) => void }) {
  return (
    <nav aria-label="Ring builder progress" className="mb-10">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEP_ORDER.map((step, index) => {
          const state = STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(current) ? "done" : step === current ? "current" : "todo";
          return (
            <li key={step} className="flex items-center gap-3">
              <button
                type="button"
                disabled={state === "todo"}
                onClick={() => onJump(step)}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-2 font-sans text-sm ${
                  state === "current"
                    ? "font-medium text-wine"
                    : state === "done"
                      ? "text-ink hover:text-wine"
                      : "cursor-not-allowed text-ink-faint"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                    state === "current"
                      ? "border-wine bg-wine text-ivory"
                      : state === "done"
                        ? "border-wine text-wine"
                        : "border-ivory-dim text-ink-faint"
                  }`}
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                {STEP_LABELS[step]}
              </button>
              {index < STEP_ORDER.length - 1 && (
                <span aria-hidden="true" className="h-px w-6 bg-ivory-dim" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function RingBuilderPage() {
  const [params, setParams] = useSearchParams();
  const { addConfiguredRing } = useCart();
  const { toast } = useToast();

  const stepParam = params.get("step");
  const settingId = params.get("setting");
  const diamondId = params.get("diamond");
  const pathParam = params.get("path");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params);
      if (value === null) next.delete(key);
      else next.set(key, value);
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  // Settings catalog (all engagement-ring settings)
  const settingsQuery = useApi<CatalogResponse>((signal) => {
    void signal;
    return api.catalog({ category: "engagement-ring", pageSize: 48 });
  }, []);
  const settings = useMemo(
    () => settingsQuery.data?.items.filter((p) => p.kind === "setting") ?? [],
    [settingsQuery.data],
  );

  // Diamonds for the chosen path
  const diamondsQuery = useApi<CatalogResponse>(
    (signal) => {
      void signal;
      return api.catalog({
        category: "loose-diamond",
        diamondType: pathParam === "lab" ? "lab-grown" : "natural",
        pageSize: 48,
        sort: "carat-asc",
      });
    },
    [pathParam],
  );
  const diamonds = useMemo(
    () => diamondsQuery.data?.items.filter((p) => p.kind === "diamond") ?? [],
    [diamondsQuery.data],
  );

  const selectedSetting = useMemo(
    () => settings.find((s) => s.id === settingId) ?? null,
    [settings, settingId],
  );
  const selectedDiamond = useMemo(
    () => diamonds.find((d) => d.id === diamondId) ?? null,
    [diamonds, diamondId],
  );

  // Determine current step from URL + selections
  const currentStep: Step = useMemo(() => {
    if (stepParam === "path" || stepParam === "setting" || stepParam === "diamond" || stepParam === "review") {
      return stepParam;
    }
    if (!settingId) return "path";
    if (!diamondId) return pathParam ? "diamond" : "setting";
    return "review";
  }, [stepParam, settingId, diamondId, pathParam]);

  const goTo = useCallback(
    (step: Step) => {
      const next = new URLSearchParams(params);
      next.set("step", step);
      // Clear downstream selections when moving backwards past them
      if (step === "path" || step === "setting") {
        next.delete("diamond");
      }
      if (step === "path") {
        next.delete("setting");
        next.delete("path");
      }
      if (step === "diamond" && !next.get("path")) {
        next.set("path", "natural");
      }
      setParams(next);
    },
    [params, setParams],
  );

  // Compatibility check — mirrors the server rule
  const isCompatible = useMemo(() => {
    if (!selectedSetting || !selectedDiamond) return true;
    const c = selectedSetting.compatibility;
    if (!c || !selectedDiamond.shape || !selectedDiamond.specs) return true;
    return (
      c.shapes.includes(selectedDiamond.shape as DiamondShape) &&
      selectedDiamond.specs.carat >= c.caratMin &&
      selectedDiamond.specs.carat <= c.caratMax
    );
  }, [selectedSetting, selectedDiamond]);

  const total = useMemo(() => {
    if (!selectedSetting || !selectedDiamond) return null;
    return addMoney([selectedSetting.price, selectedDiamond.price]);
  }, [selectedSetting, selectedDiamond]);

  /* ---------------- Render ---------------- */

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-10 lg:px-8">
      <p className="text-eyebrow text-gold-deep">Bespoke</p>
      <h1 className="mt-2 font-display text-h1 text-ink">Create Your Ring</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-ink-soft">
        Choose a setting and a centre diamond. We'll confirm the pair is compatible and price it from
        the catalog before anything reaches your bag.
      </p>

      <div className="mt-10">
        <Stepper current={currentStep} onJump={goTo} />
      </div>

      {/* ---- Step: path ---- */}
      {currentStep === "path" && (
        <section aria-label="Choose a starting point">
          <h2 className="font-display text-h2 text-ink">Where would you like to start?</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <PathCard
              title="Start with a setting"
              description="Pick the ring first, then match a diamond to it."
              onClick={() => {
                setParam("path", null);
                goTo("setting");
              }}
            />
            <PathCard
              title="Start with a natural diamond"
              description="Choose a natural stone, then find its setting."
              onClick={() => {
                setParam("path", "natural");
                setParam("diamond", null);
                goTo("diamond");
              }}
            />
            <PathCard
              title="Start with a lab-grown diamond"
              description="Choose a lab-grown stone, then find its setting."
              onClick={() => {
                setParam("path", "lab");
                setParam("diamond", null);
                goTo("diamond");
              }}
            />
          </div>
        </section>
      )}

      {/* ---- Step: setting ---- */}
      {currentStep === "setting" && (
        <section aria-label="Choose a setting">
          {settingsQuery.loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72" />
              ))}
            </div>
          )}
          {settingsQuery.error && (
            <ErrorState description={settingsQuery.error.message} onRetry={settingsQuery.refetch} />
          )}
          {!settingsQuery.loading && !settingsQuery.error && (
            <>
              <h2 className="font-display text-h2 text-ink">Choose your setting</h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {settings.map((setting) => {
                  const selected = setting.id === settingId;
                  return (
                    <li key={setting.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setParam("setting", setting.id);
                          goTo(selectedSetting ? "review" : "path");
                          setParam("step", "diamond");
                        }}
                        aria-pressed={selected}
                        className={`flex w-full flex-col border p-5 text-left transition-shadow ${
                          selected ? "border-wine shadow-card" : "border-ivory-dim hover:shadow-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg text-ink">{setting.name}</h3>
                          {selected && <Badge tone="wine">Selected</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">
                          {setting.style ? styleLabel(setting.style) : ""} ·{" "}
                          {setting.metal ? metalLabel(setting.metal) : ""}
                        </p>
                        {setting.compatibility && (
                          <p className="mt-2 text-xs text-ink-soft">
                            Fits {setting.compatibility.caratMin.toFixed(2)}–
                            {setting.compatibility.caratMax.toFixed(2)} ct
                          </p>
                        )}
                        <div className="mt-3">
                          <PriceDisplay price={setting.price} size="sm" compact />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ---- Step: diamond ---- */}
      {currentStep === "diamond" && (
        <section aria-label="Choose a diamond">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-h2 text-ink">
              Choose a {pathParam === "lab" ? "lab-grown" : "natural"} diamond
            </h2>
            <div className="inline-flex border border-ivory-dim">
              {(["natural", "lab"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setParam("path", p);
                    setParam("diamond", null);
                  }}
                  aria-pressed={pathParam === p}
                  className={`px-4 py-2 font-sans text-sm ${
                    pathParam === p ? "bg-wine text-ivory" : "text-ink hover:bg-ivory-deep"
                  }`}
                >
                  {p === "natural" ? "Natural" : "Lab-Grown"}
                </button>
              ))}
            </div>
          </div>

          {diamondsQuery.loading && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-56" />
              ))}
            </div>
          )}
          {diamondsQuery.error && (
            <ErrorState description={diamondsQuery.error.message} onRetry={diamondsQuery.refetch} />
          )}

          {!diamondsQuery.loading && !diamondsQuery.error && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {diamonds.map((diamond) => {
                const selected = diamond.id === diamondId;
                // Dim incompatible options rather than hiding them, and explain why.
                let compatible = true;
                if (selectedSetting?.compatibility && diamond.specs && diamond.shape) {
                  compatible =
                    selectedSetting.compatibility.shapes.includes(diamond.shape) &&
                    diamond.specs.carat >= selectedSetting.compatibility.caratMin &&
                    diamond.specs.carat <= selectedSetting.compatibility.caratMax;
                }
                return (
                  <li key={diamond.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!compatible) {
                          toast(
                            `This diamond doesn't fit the ${selectedSetting?.name ?? "selected setting"}`,
                            "error",
                          );
                          return;
                        }
                        setParam("diamond", diamond.id);
                        goTo("review");
                      }}
                      aria-pressed={selected}
                      disabled={!compatible}
                      className={`flex w-full flex-col border p-4 text-left transition-shadow ${
                        selected
                          ? "border-wine shadow-card"
                          : compatible
                            ? "border-ivory-dim hover:shadow-card"
                            : "border-ivory-dim opacity-55"
                      }`}
                    >
                      <DiamondArt shape={diamond.shape ?? "round"} className="aspect-square w-full" />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {diamond.specs ? `${diamond.specs.carat.toFixed(2)} ct` : diamond.name}
                        </span>
                        {selected && <Badge tone="wine">Selected</Badge>}
                      </div>
                      {diamond.specs && (
                        <p className="text-xs text-ink-soft">
                          {shapeLabel(diamond.shape ?? "round")} · {diamond.specs.color} ·{" "}
                          {diamond.specs.clarity}
                        </p>
                      )}
                      {!compatible && (
                        <p className="mt-1 text-xs text-danger">Doesn't fit the selected setting</p>
                      )}
                      <div className="mt-2">
                        <PriceDisplay price={diamond.price} size="sm" compact />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ---- Step: review ---- */}
      {currentStep === "review" && (
        <section aria-label="Review your ring">
          <h2 className="font-display text-h2 text-ink">Review your ring</h2>

          {!selectedSetting || !selectedDiamond ? (
            <div className="mt-6">
              <ErrorState
                title="Incomplete selection"
                description="Please choose both a setting and a diamond to continue."
                onRetry={() => goTo("path")}
                retryLabel="Start over"
              />
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                {/* Composition preview — honest about being an illustration */}
                <div className="border border-ivory-dim bg-white p-8">
                  <div className="relative mx-auto aspect-square max-w-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <DiamondArt
                        shape={selectedDiamond.shape ?? "round"}
                        className="w-1/2 drop-shadow-lg"
                        title="Selected centre diamond illustration"
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs text-ink-faint">
                    Illustrative composition of your selected setting and diamond. This is not a 3D
                    render or a photograph of the finished piece.
                  </p>
                </div>

                {/* Itemised summary */}
                <div>
                  <dl className="flex flex-col divide-y divide-ivory-dim border-y border-ivory-dim">
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-sm text-ink-soft">{selectedSetting.name}</dt>
                      <dd>
                        <PriceDisplay price={selectedSetting.price} size="sm" />
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-sm text-ink-soft">{selectedDiamond.name}</dt>
                      <dd>
                        <PriceDisplay price={selectedDiamond.price} size="sm" />
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="font-medium text-ink">Total</dt>
                      <dd>{total && <PriceDisplay price={total} size="lg" />}</dd>
                    </div>
                  </dl>

                  {!isCompatible && (
                    <p role="alert" className="mt-4 border border-danger/30 bg-danger-soft/40 p-3 text-sm text-danger">
                      This diamond is not compatible with the selected setting. Please choose a
                      different diamond or setting.
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      disabled={!isCompatible}
                      onClick={() => {
                        addConfiguredRing({
                          settingId: selectedSetting.id,
                          diamondId: selectedDiamond.id,
                          settingName: selectedSetting.name,
                          diamondName: selectedDiamond.name,
                        });
                        toast("Your custom ring was added to the bag", "success");
                      }}
                    >
                      Add custom ring to bag — {total ? formatMoney(total) : ""}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => goTo("setting")}>
                      Edit setting
                    </Button>
                    <Button variant="text" onClick={() => goTo("path")}>
                      Start over
                    </Button>
                  </div>

                  <p className="mt-4 text-xs text-ink-soft">
                    Adding to bag stores your exact configuration (setting + diamond IDs) so the same
                    ring reaches checkout. Prices are re-confirmed by our server.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* Helpful link */}
      <p className="mt-12 border-t border-ivory-dim pt-6 text-sm text-ink-soft">
        Unsure about sizes or grades?{" "}
        <Link to="/diamond-guide" className="text-wine underline underline-offset-4">
          Visit the Diamond Guide
        </Link>{" "}
        or{" "}
        <Link to="/ring-size-guide" className="text-wine underline underline-offset-4">
          check the ring size guide
        </Link>
        .
      </p>
    </div>
  );
}

function PathCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col border border-ivory-dim p-6 text-left transition-shadow hover:shadow-card-hover"
    >
      <h3 className="font-display text-h3 text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{description}</p>
      <span className="mt-4 font-sans text-xs font-medium tracking-[0.14em] text-wine uppercase">
        Continue →
      </span>
    </button>
  );
}
