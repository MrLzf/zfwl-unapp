# Inner Navbar Contrast Design

## Scope

Fix the shared `su-inner-navbar` component used by light tutor pages such as history, favorites, contacts, profiles, and certification.

## Behavior

- Use dark title and icon colors by default.
- Allow callers to opt into white text for intentionally dark backgrounds.
- Give the navigation capsule a translucent white background and visible border on light pages.
- Keep page-level white text for primary colored buttons unchanged.

## Verification

Add a Node source regression check for navbar defaults and capsule contrast. Run all tutor regression scripts, Prettier checks, and `git diff --check`.
