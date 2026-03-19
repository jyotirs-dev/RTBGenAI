import { expect, test, type Page } from "playwright/test";

const openApp = async (page: Page) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /user administration generated from a single schema contract/i,
    }),
  ).toBeVisible();
};

const fillUserForm = async (
  page: Page,
  values: {
    fullName: string;
    email: string;
    role: "Admin" | "Editor" | "Viewer";
    active?: boolean;
  },
) => {
  await page.getByLabel("Full Name").fill(values.fullName);
  await page.getByLabel("Email Address").fill(values.email);
  await page.getByLabel("User Role").selectOption(values.role);

  if (values.active === false) {
    await page.getByRole("checkbox", { name: /active status/i }).uncheck();
  }
};

test("loads the seeded records and summary cards", async ({ page }) => {
  await openApp(page);

  const userTable = page.getByRole("table");

  await expect(userTable.getByText("Ada Lovelace")).toBeVisible();
  await expect(userTable.getByText("Grace Hopper")).toBeVisible();
  await expect(page.getByText("Total Users")).toBeVisible();
  await expect(page.getByText("Active Users")).toBeVisible();
});

test("creates a new user", async ({ page }) => {
  await openApp(page);
  await fillUserForm(page, {
    fullName: "Avery Stone",
    email: "avery.stone@example.com",
    role: "Editor",
  });
  await page.getByRole("button", { name: /create user/i }).click();

  const userTable = page.getByRole("table");

  await expect(userTable.getByText("Avery Stone")).toBeVisible({ timeout: 3_000 });
  await expect(userTable.getByText("avery.stone@example.com")).toBeVisible();
});

test("updates an existing user", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: /edit ada lovelace/i }).click();

  await page.getByLabel("Full Name").fill("Ada Byron");
  await page.getByRole("button", { name: /update user/i }).click();

  await expect(page.getByRole("table").getByText("Ada Byron")).toBeVisible({ timeout: 3_000 });
});

test("deletes an existing user", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: /delete alan turing/i }).click();

  await expect(page.getByText("alan.turing@example.com")).toHaveCount(0);
});

test("shows validation feedback for invalid submission", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: /create user/i }).click();

  await expect(page.getByText("Full Name is required")).toBeVisible();
  await expect(page.getByText("Email Address is required")).toBeVisible();
});

test.describe("responsive smoke", () => {
  test.use({
    viewport: {
      width: 390,
      height: 844,
    },
  });

  test("renders the mobile card layout", async ({ page }) => {
    await openApp(page);
    await expect(page.getByRole("listitem").filter({ hasText: "Ada Lovelace" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /existing users/i })).toBeVisible();
  });
});
