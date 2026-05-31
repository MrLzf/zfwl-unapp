# Browse History Sync Design

## Scope

Fix tutor browse history data mixing, duplicate entries, single-item deletion, and clearing.

## Behavior

- Logged-in users display backend history when the backend request succeeds.
- Local history is only a fallback when the backend request fails.
- Backend history recording replaces an older record for the same user, target type, and target ID.
- Single-item deletion removes both backend and local records.
- Clearing removes both backend and local records.

## Verification

Add frontend source regression checks and backend service tests. Run tutor frontend regression scripts, focused Maven history tests, Prettier checks, and `git diff --check` in both repositories.
