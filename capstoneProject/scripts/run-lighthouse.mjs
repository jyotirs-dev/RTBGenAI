import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { parseArgs } from "node:util";

const defaultChromePaths = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
].filter(Boolean);

const { values } = parseArgs({
  options: {
    url: {
      type: "string",
      default: "",
    },
    outputDir: {
      type: "string",
      default: path.resolve("output/lighthouse"),
    },
    label: {
      type: "string",
      default: "audit",
    },
    chromePath: {
      type: "string",
      default: defaultChromePaths[0] ?? "",
    },
    host: {
      type: "string",
      default: "127.0.0.1",
    },
    port: {
      type: "string",
      default: "4173",
    },
    serve: {
      type: "boolean",
      default: false,
    },
    skipBuild: {
      type: "boolean",
      default: false,
    },
  },
});

if (values.chromePath.length === 0) {
  throw new Error("Unable to resolve a Chrome executable. Set CHROME_PATH before running Lighthouse.");
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const outputDir = path.resolve(values.outputDir);
const outputPrefix = path.join(outputDir, values.label);
const auditUrl = values.url.length > 0 ? values.url : `http://${values.host}:${values.port}`;
const shouldServeLocally = values.serve || values.url.length === 0;

await mkdir(outputDir, { recursive: true });

const waitForUrl = async (url) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the local preview server is ready.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url} to respond.`);
};

let previewServer;

try {
  if (shouldServeLocally) {
    if (!values.skipBuild) {
      const buildResult = spawnSync(npmCommand, ["run", "build"], { stdio: "inherit" });

      if (buildResult.status !== 0) {
        process.exit(buildResult.status ?? 1);
      }
    }

    previewServer = spawn("python3", ["-m", "http.server", values.port, "--bind", values.host], {
      cwd: path.resolve("dist"),
      stdio: "ignore",
    });

    await waitForUrl(auditUrl);
  }

  const result = spawnSync(
    "npx",
    [
      "lighthouse",
      auditUrl,
      `--chrome-path=${values.chromePath}`,
      "--chrome-flags=--headless=new --no-sandbox",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      "--output=html",
      `--output-path=${outputPrefix}`,
      "--quiet",
    ],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} finally {
  if (previewServer !== undefined && previewServer.killed === false) {
    previewServer.kill("SIGTERM");
  }
}

const reportPath = `${outputPrefix}.report.json`;
const report = JSON.parse(await readFile(reportPath, "utf8"));

const summary = Object.fromEntries(
  Object.entries(report.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)]),
);

console.log(JSON.stringify(summary, null, 2));
