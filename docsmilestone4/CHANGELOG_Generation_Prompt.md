# CHANGELOG Generation Prompt

Use the prompt below to generate `CHANGELOG.md` entries from a Conventional Commits range without inventing changes.

## Recommended Git Input

```bash
git log --reverse --format='%h%x09%s' <FROM_REF>..<TO_REF>
```

## Reusable Prompt

```text
You are generating a Markdown changelog for a React + TypeScript frontend project.

Inputs:
- Release version: <VERSION>
- Release date: <YYYY-MM-DD>
- Commit range: <FROM_REF>..<TO_REF>
- Commit list:
<PASTE git log output here>

Rules:
- Use only the provided commit list.
- Parse commit subjects using Conventional Commits.
- Group entries in this order: Features, Fixes, Performance, Refactors, Tests, Documentation, CI/CD, Chores, Other.
- Remove merge noise, duplicate wording, and empty sections.
- If a commit does not follow Conventional Commits, place it in Other with a short neutral description.
- Do not invent files, metrics, or user-facing behavior that is not supported by the commit subject.
- Rewrite terse commit messages into readable changelog bullets, but preserve technical truth.
- If the commit suggests breaking behavior, add a Breaking Changes section only when the commit subject or body explicitly states it.
- Output valid Markdown ready to append to CHANGELOG.md.

Required output shape:
# Changelog

## <VERSION> - <YYYY-MM-DD>

### Features
- ...

### Fixes
- ...

### Performance
- ...

### Refactors
- ...

### Tests
- ...

### Documentation
- ...

### CI/CD
- ...

### Chores
- ...

### Other
- ...
```

## Human Review Checks

- Confirm the commit range is correct before trusting the output.
- Delete any bullet that reads like interpretation rather than a supported change.
- Keep the changelog user-facing; move internal implementation noise to PR notes when needed.

