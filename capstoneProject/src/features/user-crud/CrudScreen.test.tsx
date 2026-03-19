import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CrudScreen } from "./CrudScreen";

const getActionButton = (name: RegExp): HTMLElement => {
  const [button] = screen.getAllByRole("button", { name });
  if (button === undefined) {
    throw new Error(`Unable to find action button matching ${name.toString()}`);
  }

  return button;
};

const getMetricValue = (label: string): HTMLElement => {
  const metric = screen.getByText(label).closest("div");

  if (metric === null) {
    throw new Error(`Unable to locate metric container for ${label}`);
  }

  const value = metric.querySelector("dd");

  if (!(value instanceof HTMLElement)) {
    throw new Error(`Unable to locate metric value for ${label}`);
  }

  return value;
};

describe("CrudScreen", () => {
  it("renders seeded records and the metadata-driven form", () => {
    render(<CrudScreen />);

    expect(screen.getByRole("heading", { name: /user administration generated from a single schema contract/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getAllByText("Ada Lovelace")).not.toHaveLength(0);
    expect(screen.getAllByText("grace.hopper@example.com")).not.toHaveLength(0);
  });

  it("shows validation feedback for invalid submissions", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.clear(screen.getByLabelText(/email address/i));
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText("Full Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email Address is required")).toBeInTheDocument();
    });
  });

  it("shows trimmed and format-specific validation feedback", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.type(screen.getByLabelText(/full name/i), "   ");
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText("Full Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email Address must be a valid email address")).toBeInTheDocument();
    });
  });

  it("creates a new user after the simulated API delay", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Roe");
    await user.type(screen.getByLabelText(/email address/i), "jane.roe@example.com");
    await user.selectOptions(screen.getByLabelText(/user role/i), "Editor");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(
      () => {
        expect(screen.getAllByText("Jane Roe")).not.toHaveLength(0);
      },
      { timeout: 2000 },
    );

    expect(screen.getAllByText("jane.roe@example.com")).not.toHaveLength(0);
  }, 7000);

  it("creates an inactive user when the status toggle is switched off", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.type(screen.getByLabelText(/full name/i), "Taylor Grey");
    await user.type(screen.getByLabelText(/email address/i), "taylor.grey@example.com");
    await user.selectOptions(screen.getByLabelText(/user role/i), "Viewer");
    await user.click(screen.getByRole("checkbox", { name: /active status/i }));
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(
      () => {
        expect(screen.getAllByText("Taylor Grey")).not.toHaveLength(0);
      },
      { timeout: 2000 },
    );

    expect(screen.getAllByText("taylor.grey@example.com")).not.toHaveLength(0);
    expect(getMetricValue("Total Users")).toHaveTextContent("4");
    expect(getMetricValue("Active Users")).toHaveTextContent("2");
  }, 7000);

  it("updates an existing record in edit mode", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.click(getActionButton(/edit ada lovelace/i));

    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Ada Byron");
    await user.click(screen.getByRole("button", { name: /update user/i }));

    await waitFor(
      () => {
        expect(screen.getAllByText("Ada Byron")).not.toHaveLength(0);
      },
      { timeout: 2000 },
    );
  }, 7000);

  it("cancels editing and restores the create-mode defaults", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.click(getActionButton(/edit ada lovelace/i));

    await user.clear(screen.getByLabelText(/full name/i));
    await user.type(screen.getByLabelText(/full name/i), "Temporary Name");
    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), "temporary@example.com");
    await user.selectOptions(screen.getByLabelText(/user role/i), "Viewer");
    await user.click(screen.getByRole("checkbox", { name: /active status/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByRole("heading", { name: /create user/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("");
    expect(screen.getByLabelText(/user role/i)).toHaveValue("Admin");
    expect(screen.getByRole("checkbox", { name: /active status/i })).toBeChecked();
  });

  it("shows the empty state after deleting every seeded user", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    await user.click(getActionButton(/delete ada lovelace/i));
    await user.click(getActionButton(/delete grace hopper/i));
    await user.click(getActionButton(/delete alan turing/i));

    expect(screen.getByRole("heading", { name: /no users yet/i })).toBeInTheDocument();
    expect(getMetricValue("Total Users")).toHaveTextContent("0");
    expect(getMetricValue("Active Users")).toHaveTextContent("0");
  });
});
