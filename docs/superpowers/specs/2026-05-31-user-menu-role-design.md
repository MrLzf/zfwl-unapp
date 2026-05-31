# User Menu Role Design

## Scope

Optimize the tutor user-center menu for role-specific entries and live status badges.

## Behavior

- Hide teacher certification from parent users.
- Keep teacher certification visible for teacher users with the current certification status.
- Show the current tutor role on the profile menu.
- Show the current selected city on the city menu.
- Replace the hard-coded `+50积分` badge with the current point balance.
- Keep existing row-level navigation behavior.

## Verification

Add a Node source regression check. Run all tutor frontend regression scripts, Prettier checks, and `git diff --check`.
