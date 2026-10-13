import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastProvider } from "../components/ui/Toast";
import { AppointmentPage } from "./AppointmentPage";

/**
 * Route-level smoke tests. These pages are lazily loaded, so they are also the
 * ones a visual pass is least likely to reach — each must render its heading,
 * its form/steps, and a reveal wrapper around the intro.
 */

class StubObserver {
  observed: Element[] = [];
  observe(node: Element) {
    this.observed.push(node);
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", StubObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AppointmentPage", () => {
  it("renders its heading, reveal wrapper and form", () => {
    render(
      <ToastProvider>
        <AppointmentPage />
      </ToastProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Book an Appointment" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".reveal")).not.toBeNull();
    expect(document.querySelector("form input, form select, form textarea")).not.toBeNull();
  });
});
