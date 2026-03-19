# Pull Request Summary Template

## Summary

Describe the user-visible or developer-visible change in 2-4 sentences.

## Impact

- What behavior changed?
- Which modules, scripts, or workflows were affected?
- What documentation or operational updates were included?

## Risks

- Note likely regression areas.
- Call out temporary tradeoffs or follow-up work.
- Mention any environment-specific dependencies for reviewers.

## Testing Instructions

- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run build:analyze`
- `npm run audit:lighthouse -- --outputDir ./output/lighthouse --label pr`

## Screenshots / Evidence

- Add before/after screenshots for UI changes.
- Link Lighthouse or bundle reports when performance is involved.
- Link unit and E2E results when behavior changed.
