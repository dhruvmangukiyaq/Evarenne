import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Button } from "./Button";
import { Breadcrumbs, EmptyState, ErrorState, Skeleton, Badge } from "./Display";
import { Checkbox, Input, RadioGroup, Select } from "./Form";
import { Dialog, Drawer } from "./Overlay";
import { ToastProvider } from "./Toast";
import { useToast } from "./toast-context";

describe("Button", () => {
  it("renders and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to bag</Button>);
    await userEvent.click(screen.getByRole("button", { name: /add to bag/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and non-interactive when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Unavailable
      </Button>,
    );
    const button = screen.getByRole("button", { name: /unavailable/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes loading state and blocks interaction", () => {
    render(<Button loading>Adding</Button>);
    const button = screen.getByRole("button", { name: /adding/i });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });

  it("defaults to type=button to avoid accidental form submits", () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveAttribute("type", "button");
  });
});

describe("Input", () => {
  it("associates label, hint and error with the control", () => {
    render(<Input label="Email" hint="We never share it" error="Enter a valid email" required />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
  });
});

describe("Select", () => {
  it("renders options and fires change", async () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Metal"
        options={[
          { value: "platinum", label: "Platinum" },
          { value: "yellow-gold", label: "Yellow Gold" },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText(/metal/i), "yellow-gold");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("option", { name: "Platinum" })).toBeInTheDocument();
  });
});

describe("Checkbox", () => {
  it("toggles when label is clicked", async () => {
    render(<Checkbox label="Include certificate" />);
    const checkbox = screen.getByRole("checkbox", { name: /certificate/i });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(screen.getByText(/include certificate/i));
    expect(checkbox).toBeChecked();
  });
});

describe("RadioGroup", () => {
  it("selects an option and reports change", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Diamond type"
        name="type"
        value={null}
        onChange={onChange}
        options={[
          { value: "natural", label: "Natural" },
          { value: "lab-grown", label: "Lab-Grown" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /lab-grown/i }));
    expect(onChange).toHaveBeenCalledWith("lab-grown");
  });
});

describe("Breadcrumbs", () => {
  it("marks the last item as current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[{ label: "Home", to: "/" }, { label: "Diamonds", to: "/diamonds" }, { label: "Oval" }]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("Oval")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });
});

describe("EmptyState / ErrorState / Skeleton / Badge", () => {
  it("renders empty state with action", () => {
    render(<EmptyState title="No diamonds found" description="Try clearing filters" />);
    expect(screen.getByRole("heading", { name: /no diamonds found/i })).toBeInTheDocument();
  });

  it("renders error state with retry", async () => {
    const onRetry = vi.fn();
    render(<ErrorState description="Network error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("hides skeleton from the accessibility tree", () => {
    const { container } = render(<Skeleton className="h-10 w-40" />);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("renders badge with visible text (not color-only)", () => {
    render(<Badge tone="olive">Natural</Badge>);
    expect(screen.getByText("Natural")).toBeInTheDocument();
  });
});

describe("Dialog", () => {
  function Harness() {
    return (
      <Dialog open onClose={() => {}} title="Diamond care" description="How to store">
        <p>Keep each stone in its own pouch.</p>
      </Dialog>
    );
  }

  it("is a labelled modal dialog", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog", { name: /diamond care/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription(/how to store/i);
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Test">
        body
      </Dialog>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Drawer", () => {
  it("renders with accessible name and closes via close button", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        <p>Filter body</p>
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { name: /filters/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^close$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Toast", () => {
  function Harness() {
    const { toast } = useToast();
    return <button onClick={() => toast("Added to bag", "success")}>Trigger</button>;
  }

  it("announces toasts politely and shows message", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /trigger/i }));
    expect(await screen.findByText("Added to bag")).toBeInTheDocument();
    expect(screen.getByText("Added to bag").closest("[aria-live='polite']")).toBeInTheDocument();
  });
});
