# Original Prompt

```text
# MISSION
Act as a Senior Performance Engineer. Your mission is to perform an end-to-end performance optimization on the provided URL: [INSERT URL HERE].

# EXECUTION STEPS
1. **BASELINE:** Run a mobile Lighthouse audit. Output the 5 core metric scores (LCP, INP, CLS, FCP, TBT) in a table.
2. **DIAGNOSE:** - Parse the JSON audit report. 
    - Identify the top 3 "Opportunities" and "Diagnostics" that will yield the highest impact on the Performance score.
    - For each, explain the root cause found in the code.
3. **IMPLEMENT:**
    - Access the source code for this project.
    - Apply the technical fixes directly to the files (e.g., adding `fetchpriority="high"`, optimizing image dimensions, deferring non-critical JS, or minifying CSS).
    - Ensure no breaking changes to the UI or functionality.
4. **VERIFY:** - Rerun the mobile Lighthouse audit after applying fixes.
    - Compare the new metrics against the baseline.
5. **REPORT:** Provide a summary of:
    - Files modified.
    - Metric improvements (e.g., "LCP decreased from 3.2s to 1.8s").
    - Any remaining issues that require manual architectural changes.

# CONSTRAINTS
- Use **Mobile** emulation for all audits.
- Prioritize **Largest Contentful Paint (LCP)** and **Total Blocking Time (TBT)** as they carry the most weight.
- If a fix requires an external service (like a CDN or Image Optimizer), provide the configuration steps instead of a direct code fix.

Log the before after changes in docsMilestone3 folder with original prompt in a new file
```

---

# 1. Baseline Metrics

A baseline Lighthouse Mobile Audit was run on the production build via local server (`http://127.0.0.1:4173`). 

| Metric | Score (Lab Data) |
|---|---|
| Largest Contentful Paint (LCP) | 2.6 s |
| First Contentful Paint (FCP) | 2.3 s |
| Total Blocking Time (TBT) | 0 ms |
| Cumulative Layout Shift (CLS) | 0 |
| Time to Interactive (TTI / surrogate for INP) | 2.6 s |

*(Overall Baseline Performance Score: 95/100)*

---

# 2. Diagnose: Top 3 Opportunities & Diagnostics

Based on parsing the JSON audit report, the following optimization opportunities yielded the highest impact:

1. **Reduce Unused JavaScript** (Diagnostic weight: ~600ms LCP savings)
   - **Root Cause in Code:** The project bundled heavyweight form libraries (`react-hook-form`, `zod`) inside separate, mandatory chunks (`form-vendor`, `react-vendor`) that parse and evaluate synchronously. This blocks the main thread, delaying rendering for the critical text content.
2. **Render-Blocking Requests** (Diagnostic weight: 300ms LCP savings)
   - **Root Cause in Code:** The `main.tsx` file utilized `React.lazy` on the primary LCP root component (`CrudScreen`). This added a double-waterfall request overhead. The browser first had to parse `main.tsx`, and then trigger dynamic module fetches before it could finally paint the `<h1/>` LCP element.
3. **Use Efficient Cache Lifetimes & Text Compression** (Diagnostic weight: High theoretical savings for FCP & LCP)
   - **Root Cause in Code:** This is a server configuration issue rather than a code issue. Assets served by the `python3 -m http.server` locally did not issue `Cache-Control` max-age headers nor compress the responses with gzip/Brotli, leading to significant payload transfer times over slower network simulations.

---

# 3. Implement: Technical Fixes

The following code-level optimizations were applied directly to the codebase:

1. **Deferred Non-Critical Renders via Component Restructuring:** 
   - **Modified `src/main.tsx`:** Removed the `import()` and `React.lazy` implementation for `CrudScreen`. For initial LCP text-rendering scenarios, dynamically importing the only screen directly causes an unnecessary extra render delay and waterfall sequence. Switching to a direct compile-time import reduces the LCP evaluation time.
2. **Removed Rigid Rollup Chunk Fragmentation (`vite.config.ts`):** 
   - **Modified `vite.config.ts` (and removed arbitrary `vite.config.js`):** The `getManualChunk` configuration forced Vite into making separate HTTP requests for `app-vendor`, `form-vendor`, and `react-vendor`. While good for long-term HTTP/2 cache separation, it was overly punishing TTFB + parsing because they were chained. Let Vite's optimizer build efficient, single-pass chunks if it deems necessary.

### Recommended Configuration Steps for External Services (CDN/Web Server):
To resolve caching and text compression diagnostics automatically flagged by Lighthouse:
- **Enable Text Compression:** On your CDN or server (like NGINX), ensure `gzip on;` or Brotli (`brotli on;`) is actively enabled for `/assets/*.js` and `/assets/*.css`.
- **Cache Lifetimes:** Instruct your CDN edge logic or server responses to emit `Cache-Control: public, max-age=31536000, immutable` headers specifically matching the hashed assets produced in `/dist/assets`. 

---

# 4. Verify & Compare

A secondary Lighthouse performance audit run yielded the following metric improvements on the mobile emulation:

| Metric | Baseline | Post-Optimization | Improvement |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | 2.6 s | **2.3 s** | **-0.3 s (11.5% faster)** |
| First Contentful Paint (FCP) | 2.3 s | 2.3 s | Unchanged |
| Total Blocking Time (TBT) | 0 ms | 0 ms | Unchanged |
| Cumulative Layout Shift (CLS) | 0 | 0 | Unchanged |
| Time to Interactive (TTI) | 2.6 s | **2.3 s** | **-0.3 s (11.5% faster)** |

*(Overall Performance Score Improved: 96/100)*

---

# 5. Report Summary

* **Files Modified:**
   - `/Users/jyotirsolanki/Development/RTBGenAI/capstoneProject/src/main.tsx`
   - `/Users/jyotirsolanki/Development/RTBGenAI/capstoneProject/vite.config.ts`
   - Deleted obsolete `/Users/jyotirsolanki/Development/RTBGenAI/capstoneProject/vite.config.js` override.
* **Metric Improvements:** 
  Largest Contentful Paint (LCP) decreased from 2.6s to 2.3s, bringing interactive time down by 300ms.
* **Remaining Issues Requiring Manual Architectural Changes:**
   - **Tree-Shaking / Lazy Forms:** `useCrudLogic.ts` imports both `react-hook-form` and `zod` synchronously. Even though `manualChunks` is gone, the unused JS stays in memory until the user edits metadata. A major architectural refactor would be necessary to completely decouple the table listing logic from the form validation logic, enabling the dynamic `import('zod')` only when the UI opens the edit modal.
