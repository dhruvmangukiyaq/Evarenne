import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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

/** Renders the page inside a router so search params resolve like in the app. */
function renderPage(initialUrl: string) {
  render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <ToastProvider>
        <Routes>
          <Route path="/appointments" element={<AppointmentPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("AppointmentPage", () => {
  it("renders its heading, reveal wrapper and form", () => {
    renderPage("/appointments");

    expect(
      screen.getByRole("heading", { level: 1, name: "Inquire Now" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".reveal")).not.toBeNull();
    expect(document.querySelector("form input, form select, form textarea")).not.toBeNull();
  });

  it("adopts the diamond carried over from a detail page's Inquire Now button", () => {
    renderPage("/appointments?product=Lab-Grown%20Round%201.01%20CT&sku=EV-1001");

    expect(screen.getByText(/Enquiring about Lab-Grown Round 1\.01 CT/)).toBeInTheDocument();

    const notes = document.querySelector<HTMLTextAreaElement>('[name="notes"]');
    expect(notes?.value).toContain("Lab-Grown Round 1.01 CT (SKU EV-1001)");

    const topic = document.querySelector<HTMLSelectElement>('[name="topic"]');
    expect(topic?.value).toBe("diamond");
  });
});
