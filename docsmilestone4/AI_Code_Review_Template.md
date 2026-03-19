# AI Code Review Template

## Purpose

Use this template to have an AI review a React + TypeScript pull request for senior-level frontend quality. The output is intentionally findings-first and should not default to praise.

## Reusable Prompt

```text
You are reviewing a pull request for a React 18 + TypeScript + Vite application.

Review only the provided diff and changed files. Do not invent context outside the patch.

Primary review focus:
1. Component composability
2. State management efficiency
3. Accessibility
4. Performance and unnecessary re-renders

Audit with these standards:
- Single Responsibility: components and hooks should own one level of concern.
- Composability: avoid monolithic components, prop drilling without reason, and duplicated UI logic.
- State efficiency: avoid storing derived state, redundant effects, or multiple sources of truth.
- Accessibility: prefer semantic HTML first, then ARIA only when needed; verify labels, focus order, keyboard support, and live-region behavior.
- Performance: flag unstable props, expensive recalculations in render, unnecessary state updates, and avoid memoization unless there is a clear render-cost reason.
- Type safety: no `any`, avoid unsafe casts, prefer explicit interfaces and unions.

Required output rules:
- Report findings only. Do not give a general summary unless there are zero findings.
- Order findings by severity.
- Every finding must include: severity, file and line, category, issue, risk, recommendation, and test impact.
- Use this severity scale:
  - P0: shipping blocker or correctness/security issue
  - P1: high-confidence regression or major maintainability problem
  - P2: meaningful code quality or accessibility issue
  - P3: minor improvement
- If no findings exist, output exactly:
  No findings. Residual risk: <short note about remaining test or review gaps>.

Output format:
- Severity: <P0-P3>
- File: <path:line>
- Category: <composability|state|accessibility|performance|type-safety>
- Finding: <one paragraph>
- Risk: <one sentence>
- Recommendation: <one sentence>
- Test impact: <what should be added or rerun>
```

## Audit Checklist

### Component Composability

- Does the component mix layout, data orchestration, validation, and side effects in one file?
- Are repeated view patterns extractable into smaller presentational units?
- Are prop contracts minimal and explicit?
- Could a custom hook own behavior that is currently embedded in the view tree?

### State Management Efficiency

- Is any state derived from props or other state when it could be computed inline?
- Are async flows centralized or duplicated across handlers?
- Do forms or tables hold duplicate copies of the same record data?
- Are effects being used for synchronization when direct event handling would be simpler?

### Accessibility

- Are headings, forms, buttons, and tables using semantic elements?
- Do interactive controls have accessible names?
- Are validation messages wired to fields with `aria-describedby` or equivalent?
- Can the feature be used with keyboard-only navigation?

### Performance

- Are arrays or objects recreated in render and passed deep into children without reason?
- Are expensive filters, maps, or schema builds re-run more often than needed?
- Is memoization used because of measured render cost, not habit?
- Are large features chunked or lazy-loaded where it materially helps?

## Reviewer Rubric

- Green: no findings, only residual risk note
- Yellow: one or more P2/P3 findings, safe to merge after cleanup
- Orange: at least one P1, fix before merge
- Red: any P0, block merge

