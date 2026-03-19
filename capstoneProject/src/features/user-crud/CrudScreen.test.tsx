import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CrudScreen } from "./CrudScreen";

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

  it("updates an existing record in edit mode", async () => {
    const user = userEvent.setup();

    render(<CrudScreen />);

    const editButtons = screen.getAllByRole("button", { name: /edit ada lovelace/i });
    expect(editButtons).not.toHaveLength(0);
    await user.click(editButtons[0]!);

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
});
