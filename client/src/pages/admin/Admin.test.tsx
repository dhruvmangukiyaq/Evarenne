import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminGuard } from "./AdminGuard";
import { AdminLoginPage } from "./AdminLoginPage";

/**
 * The admin gate, end to end in the browser: the password screen posts to the
 * API and moves on, and unauthenticated visitors are bounced off the protected
 * routes before any admin component renders.
 */

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

const PASSWORD = "correct-horse-battery-staple";

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubSession(authenticated: boolean) {
  fetchMock.mockImplementation((url: string) => {
    if (String(url).startsWith("/api/admin/session")) {
      return Promise.resolve(jsonResponse({ authenticated, configured: true }));
    }
    return Promise.resolve(jsonResponse({ error: "Not found" }, 404));
  });
}

describe("AdminLoginPage", () => {
  it("signs in and moves to the dashboard", async () => {
    stubSession(false);
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (String(url).startsWith("/api/admin/session")) {
        return Promise.resolve(jsonResponse({ authenticated: false, configured: true }));
      }
      if (String(url).startsWith("/api/admin/login")) {
        const body = JSON.parse(String(init?.body)) as { password: string };
        if (body.password === PASSWORD) return Promise.resolve(jsonResponse({ ok: true }));
        return Promise.resolve(jsonResponse({ error: "That password is not correct." }, 401));
      }
      return Promise.resolve(jsonResponse({ error: "Not found" }, 404));
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/products" element={<div>Products dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Admin sign in" });
    await user.type(screen.getByLabelText(/^Password/), PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByText("Products dashboard");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows the server's reason when the password is wrong", async () => {
    stubSession(false);
    fetchMock.mockImplementation((url: string) => {
      if (String(url).startsWith("/api/admin/session")) {
        return Promise.resolve(jsonResponse({ authenticated: false, configured: true }));
      }
      return Promise.resolve(jsonResponse({ error: "That password is not correct." }, 401));
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/products" element={<div>Products dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { name: "Admin sign in" });
    await user.type(screen.getByLabelText(/^Password/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("That password is not correct.");
    });
    expect(screen.queryByText("Products dashboard")).not.toBeInTheDocument();
  });
});

describe("AdminGuard", () => {
  const routes = (
    <Routes>
      <Route path="/admin" element={<AdminGuard />}>
        <Route index element={<div>Protected content</div>} />
      </Route>
      <Route path="/admin/login" element={<div>Login screen</div>} />
    </Routes>
  );

  it("redirects an unauthenticated visitor to the password screen", async () => {
    stubSession(false);
    render(
      <MemoryRouter initialEntries={["/admin"]}>{routes}</MemoryRouter>,
    );

    await screen.findByText("Login screen");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the admin content once the server confirms the session", async () => {
    stubSession(true);
    render(
      <MemoryRouter initialEntries={["/admin"]}>{routes}</MemoryRouter>,
    );

    await screen.findByText("Protected content");
    expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  });
});
