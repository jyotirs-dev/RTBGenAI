import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:4173/";
const outputDir = new URL("../output/playwright/", import.meta.url);

const waitForApp = async (page) => {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", {
    name: /user administration generated from a single schema contract/i,
  }).waitFor();
};

const main = async () => {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });

  await waitForApp(page);
  await page.screenshot({
    path: new URL("crud-dashboard.png", outputDir).pathname,
    fullPage: true,
  });

  await page.getByRole("button", { name: /edit ada lovelace/i }).first().click();
  await page.screenshot({
    path: new URL("crud-edit-mode.png", outputDir).pathname,
    fullPage: true,
  });

  await page.getByLabel("Full Name").fill("Jane Roe");
  await page.getByLabel("Email Address").fill("jane.roe@example.com");
  await page.getByLabel("User Role").selectOption("Editor");
  await page.getByRole("button", { name: /update user/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: new URL("crud-updated-record.png", outputDir).pathname,
    fullPage: true,
  });

  await page.getByLabel("Full Name").fill("Morgan Lee");
  await page.getByLabel("Email Address").fill("morgan.lee@example.com");
  await page.getByLabel("User Role").selectOption("Viewer");
  await page.getByRole("button", { name: /create user/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: new URL("crud-created-record.png", outputDir).pathname,
    fullPage: true,
  });

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
