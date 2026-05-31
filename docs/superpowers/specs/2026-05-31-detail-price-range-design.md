# Detail Price Range Design

## Scope

Update tutor detail pricing for both parent demands and teacher resumes. Keep list pages and backend contracts unchanged.

## Behavior

- Prefer `budgetMin` and `budgetMax` for parent demand details.
- Prefer `hourlyPriceMin` and `hourlyPriceMax` for teacher resume details.
- Display a range when both values exist and differ.
- Display one amount when both values are equal or only a legacy single amount exists.
- Display `价格面议` when no amount exists.

## Architecture

Add a shared formatter in `sheep/api/tutor/utils.js` and call it from the detail page. Preserve the existing normalized single-value fields for compatibility with other pages.

## Verification

Add a Node source regression check for the formatter and detail-page wiring. Run all tutor regression scripts, Prettier checks, and `git diff --check`.
