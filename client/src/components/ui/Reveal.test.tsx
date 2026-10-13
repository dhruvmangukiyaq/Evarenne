import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { Reveal } from "./Reveal";

/**
 * The reveal only reports through an IntersectionObserver, so the tests drive
 * it with a stub observer and hand it the intersection records a real one
 * would deliver.
 */

interface Record {
  isIntersecting: boolean;
  boundingClientRect: { top: number; bottom: number };
}

type Callback = (entries: Record[]) => void;

class StubObserver {
  static instances: StubObserver[] = [];
  static reset() {
    StubObserver.instances = [];
  }
  static latest(): StubObserver {
    const last = StubObserver.instances[StubObserver.instances.length - 1];
    if (!last) throw new Error("No observer was created");
    return last;
  }

  observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: Callback) {
    StubObserver.instances.push(this);
  }

  observe(node: Element) {
    this.observed.push(node);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  report(entries: Record[]) {
    act(() => {
      this.callback(entries);
    });
  }
}

const inView = (): Record[] => [
  { isIntersecting: true, boundingClientRect: { top: 120, bottom: 320 } },
];
const belowFold = (): Record[] => [
  { isIntersecting: false, boundingClientRect: { top: 2000, bottom: 2400 } },
];
const scrolledPast = (): Record[] => [
  { isIntersecting: false, boundingClientRect: { top: -600, bottom: -400 } },
];

beforeEach(() => {
  StubObserver.reset();
  vi.stubGlobal("IntersectionObserver", StubObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("starts hidden and carries the stagger delay", () => {
    const { container } = render(
      <Reveal delay={300}>
        <p>Hero copy</p>
      </Reveal>,
    );

    const node = container.firstElementChild as HTMLElement;
    expect(node).toHaveClass("reveal", "reveal-up");
    expect(node).not.toHaveClass("is-visible");
    expect(node).toHaveStyle({ animationDelay: "300ms" });
    expect(node).toHaveTextContent("Hero copy");
  });

  it("reveals once the element enters the viewport", () => {
    const { container } = render(<Reveal>Content</Reveal>);

    expect(StubObserver.latest().observed).toHaveLength(1);
    StubObserver.latest().report(inView());

    const node = container.firstElementChild as HTMLElement;
    expect(node).toHaveClass("is-visible");
    // Reveal happens once, then the observer is released.
    expect(StubObserver.latest().disconnected).toBe(true);
  });

  it("stays hidden while the element is still below the fold", () => {
    const { container } = render(<Reveal>Content</Reveal>);

    StubObserver.latest().report(belowFold());

    expect(container.firstElementChild).not.toHaveClass("is-visible");
  });

  it("reveals content already scrolled above the viewport", () => {
    const { container } = render(<Reveal>Content</Reveal>);

    // A restored scroll position never intersects again — it must not strand
    // the content at opacity 0.
    StubObserver.latest().report(scrolledPast());

    expect(container.firstElementChild).toHaveClass("is-visible");
  });

  it("applies the requested variant", () => {
    const { container } = render(<Reveal variant="soft">Soft</Reveal>);
    expect(container.firstElementChild).toHaveClass("reveal-soft");

    const fade = render(<Reveal variant="fade">Fade</Reveal>);
    expect(fade.container.firstElementChild).toHaveClass("reveal-fade");
  });

  it("renders the requested element so list semantics survive", () => {
    const { container } = render(
      <ul>
        <Reveal as="li">Item</Reveal>
      </ul>,
    );

    expect(container.querySelector("ul > li")).not.toBeNull();
    expect(container.querySelector("div")).toBeNull();
  });

  it("renders straight to the shown state when no observer exists", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const { container } = render(<Reveal delay={100}>Always visible</Reveal>);
    const node = container.firstElementChild as HTMLElement;

    // No hidden class at all: nothing could ever reveal it.
    expect(node).not.toHaveClass("reveal");
    expect(node).not.toHaveStyle({ animationDelay: "100ms" });
    expect(node).toHaveTextContent("Always visible");
  });
});
