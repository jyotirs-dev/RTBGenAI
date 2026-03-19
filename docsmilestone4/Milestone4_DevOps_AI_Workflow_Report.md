# Milestone 4: DevOps, CI/CD, and Continuous Upskilling Report

Date: March 19, 2026

## Objective

This milestone extends the metadata-driven React CRUD app in `capstoneProject` with production-oriented DevOps assets, enforceable PR validation, and a documentation pack that shows how GenAI can support frontend delivery without weakening security or engineering rigor.

## Current Project Context

- App: Vite + React 18 + TypeScript CRUD demo
- Runtime: Node 20+ and npm
- Test stack: Vitest and Playwright
- Infra targets for this milestone: Docker, Nginx, GitHub Actions
- Evidence baseline: [docsmilestone3](../docsmilestone3) for SEO, bundle, build, and QA metrics

## Original Prompt

```text
Role: You are a Senior Full-Stack & DevOps Architect with 10+ years of experience. Your goal is to guide a Frontend Engineer through Milestone 4: DevOps, CI/CD, & Continuous Upskilling.

Context:
- Tech Stack: Node 20+, npm, React 18+ (or Angular 17+), Vite.
- Infrastructure: GitHub Actions, Docker (Multi-stage), Nginx.
- Objective: Automate the deployment lifecycle and optimize professional growth using GenAI.

Task 1: Infrastructure as Code
- Generate a production-grade Dockerfile and a GitHub Actions pipeline.
- Dockerfile requirements: multi-stage build, non-root user, optimized layer caching.
- CI/CD requirements: trigger on PRs to main, dependency caching, linting, type-checking, unit testing, and build artifacts.

Task 2: AI-Assisted Quality Control
- Create a code review template an AI can use to audit PRs.
- Provide a prompt to auto-generate CHANGELOG.md based on Conventional Commits.

Task 3: Career & Style Optimization
- Rewrite a technical project description using the STAR method with measurable metrics.
- Analyze a code snippet for senior-level refactoring with SOLID and custom hook extraction.

Task 4: The Capstone Documenter
- Draft the final AI-Augmented Frontend Engineer workflow.
- Include lifecycle overview, Golden Prompt Vault, and governance rules.

Constraints:
- No `any` types in TypeScript.
- Security best practices only.
- No hardcoded secrets in YAML.
- Store generated docs and reports in `docsmilestone4`.
```

## Implemented Infrastructure

### `capstoneProject/Dockerfile`

Rationale: the Docker build compiles the app in `node:20-alpine` and serves only the static production output from an unprivileged Nginx image. Copying package manifests first preserves Docker layer caching for dependency installation.

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

WORKDIR /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:0 /app/dist ./

USER 101:0

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### `capstoneProject/nginx/default.conf`

Rationale: the Nginx config handles SPA routing with `try_files`, prevents stale `index.html` caching, and gives hashed asset files an immutable cache policy.

```nginx
server {
    listen 8080;
    listen [::]:8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location = /index.html {
        add_header Cache-Control "no-store, must-revalidate" always;
        try_files $uri =404;
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        try_files $uri =404;
    }

    location / {
        add_header Cache-Control "no-store" always;
        try_files $uri $uri/ /index.html;
    }
}
```

### `capstoneProject/eslint.config.js`

Rationale: the project now has a flat, type-aware ESLint setup that enforces hooks correctness, accessibility checks, and a strict `no-explicit-any` rule while staying scoped to the actual app and TypeScript config files.

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const lintTargets = ["src/**/*.{ts,tsx}", "playwright.config.ts", "vite.config.ts"];

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "output/**",
      "test-results/**",
      "coverage/**",
      "*.d.ts",
      "*.js",
      "*.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs["flat/recommended-type-checked"],
  ...tseslint.configs["flat/stylistic-type-checked"],
  {
    files: lintTargets,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: currentDirectory,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "no-duplicate-imports": "error",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },
  {
    files: ["src/main.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
```

### `capstoneProject/package.json` script additions

Rationale: explicit `lint` and `typecheck` commands let local workflows and GitHub Actions share the same contract.

```json
{
  "scripts": {
    "lint": "eslint src playwright.config.ts vite.config.ts",
    "typecheck": "tsc -b",
    "build": "tsc -b && vite build",
    "test": "npm run test:unit"
  }
}
```

### `.github/workflows/frontend-pr-validation.yml`

Rationale: the GitHub Actions workflow validates only pull requests targeting `main`, uses npm caching, avoids elevated permissions, smoke-tests the Docker image, and uploads `dist` as an artifact for downstream review or deployment jobs.

```yaml
name: Frontend PR Validation

on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review

permissions:
  contents: read

concurrency:
  group: frontend-pr-validation-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    timeout-minutes: 20
    defaults:
      run:
        working-directory: capstoneProject
    env:
      CI: "true"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: capstoneProject/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint source
        run: npm run lint

      - name: Type-check source
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test

      - name: Build production bundle
        run: npm run build

      - name: Smoke-test Docker build
        run: docker build --tag rtbgenai-user-crud:pr-${{ github.event.pull_request.number }} .

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist-pr-${{ github.event.pull_request.number }}
          path: capstoneProject/dist
          if-no-files-found: error
          retention-days: 7
```

## Security Decisions

- The final container runs as user `101:0` instead of root.
- The runtime image is Nginx-only; the Node toolchain stays in the build stage.
- The workflow uses `permissions: contents: read` and does not request write scopes.
- No secrets are embedded in the workflow; future registry or deployment integration must read from GitHub Secrets.
- The lint configuration enforces `@typescript-eslint/no-explicit-any`.

## Validation Results

Executed locally in `capstoneProject`:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed with 8 tests in 1 file
- `npm run build`: passed and generated a production `dist/`

Observed build output after the Milestone 4 changes:

- `dist/index.html`: `0.84 kB`, gzip `0.44 kB`
- `dist/assets/index-Cy9J5OHn.css`: `27.71 kB`, gzip `6.00 kB`
- `dist/assets/index-BjuCmzD3.js`: `4.31 kB`, gzip `1.89 kB`
- `dist/assets/CrudScreen-phcK6vbQ.js`: `14.40 kB`, gzip `4.03 kB`
- `dist/assets/form-vendor-Cnvso62Y.js`: `87.91 kB`, gzip `26.33 kB`
- `dist/assets/react-vendor-BNPuDv6A.js`: `137.81 kB`, gzip `44.15 kB`

Local Docker smoke validation could not be completed because the workstation did not have the `docker` binary installed. The new CI workflow includes a Docker build step so the container path is still validated on pull requests.

## References to Milestone 3 Evidence

- Lighthouse summary and SEO improvement: [AI_Assisted_QA_Optimization_Report.md](../docsmilestone3/AI_Assisted_QA_Optimization_Report.md)
- Baseline bundle report: [baseline bundle report](../docsmilestone3/assets/baseline/bundle/bundle-report.md)
- Final bundle report: [final bundle report](../docsmilestone3/assets/final/bundle/bundle-report.md)
- Prior automated QA logs: [final logs](../docsmilestone3/assets/final/logs)

