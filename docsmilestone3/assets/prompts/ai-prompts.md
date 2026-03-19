# AI Prompt Log

These are the task-focused prompts used to drive the milestone 3 implementation and documentation workflow.

## Documentation Generation

```text
Generate JSDoc for exported hooks, components, types, and non-trivial helper functions in the CRUD feature. Keep the comments concise, accurate, and aligned to the existing implementation.
```

## README Generation

```text
Create a README for the Vite + React + TypeScript CRUD project with setup, usage, architecture overview, dependency map summary, testing workflow, and performance audit commands.
```

## PR Summary

```text
Summarize the milestone 3 diff against main. Include summary, impact, risks, testing instructions, and evidence references in a reusable PR format.
```

## Dependency Mapping

```text
Analyze the actual import graph in the CRUD feature, tests, and scripts. Produce a structured dependency map and Mermaid graph validated against the source files.
```

## Architecture Diagram

```text
Generate a Mermaid architecture diagram that shows the render flow from main.tsx, metadata-driven form generation, validation, CRUD state transitions, and test/audit touchpoints.
```

## Unit and E2E Test Generation

```text
Expand unit coverage for delete, cancel/reset, status toggle, empty state, and validation edge cases. Add Playwright E2E coverage for load, create, edit, delete, validation, and a mobile smoke scenario.
```

## Lighthouse and Performance Analysis

```text
Run baseline and final Lighthouse audits, explain the highest-impact findings, implement bundle and metadata improvements, and compare before/after bundle sizes and Lighthouse scores.
```
