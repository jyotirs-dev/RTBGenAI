import { mkdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const { values } = parseArgs({
  options: {
    baseUrl: {
      type: "string",
      default: "http://127.0.0.1:4173/",
    },
    outDir: {
      type: "string",
      default: path.resolve("output/playwright"),
    },
  },
});

const waitForApp = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", {
    name: /user administration generated from a single schema contract/i,
  }).waitFor();
};

const main = async () => {
  const outputDir = path.resolve(values.outDir);
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });

  await waitForApp(page, values.baseUrl);
  await page.screenshot({
    path: path.join(outputDir, "dashboard.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: /edit ada lovelace/i }).first().click();
  await page.screenshot({
    path: path.join(outputDir, "edit-mode.png"),
    fullPage: true,
  });

  await page.getByLabel("Full Name").fill("Jane Roe");
  await page.getByLabel("Email Address").fill("jane.roe@example.com");
  await page.getByLabel("User Role").selectOption("Editor");
  await page.getByRole("button", { name: /update user/i }).click();
  await page.waitForTimeout(1_200);
  await page.screenshot({
    path: path.join(outputDir, "updated-record.png"),
    fullPage: true,
  });

  await page.getByLabel("Full Name").fill("Morgan Lee");
  await page.getByLabel("Email Address").fill("morgan.lee@example.com");
  await page.getByLabel("User Role").selectOption("Viewer");
  await page.getByRole("button", { name: /create user/i }).click();
  await page.waitForTimeout(1_200);
  await page.screenshot({
    path: path.join(outputDir, "created-record.png"),
    fullPage: true,
  });

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
