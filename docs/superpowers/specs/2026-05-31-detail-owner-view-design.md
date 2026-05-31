# Detail Owner View Design

## Scope

Update demand and resume details so publishers see their own contact details without interaction actions or masking.

## Behavior

- The backend returns full contact details with zero point cost when the logged-in user owns the viewed post.
- Owner views do not create contact-view records or deduct points.
- The frontend compares the post `userId` with the current tutor profile `userId`.
- Owner views hide the bottom favorite, match, and view-contact action bar.
- Owner views show full contact details and hide the masking explanation.
- Non-owner views keep the current behavior.

## Verification

Add frontend source regression checks and backend unit tests. Run tutor frontend regression scripts, the focused Maven test, Prettier checks, and `git diff --check` in both repositories.
