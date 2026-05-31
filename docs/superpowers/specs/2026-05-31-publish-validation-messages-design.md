# Publish Validation Messages Design

## Scope

Update validation feedback in `pages/index/publish.vue` for both parent and teacher publishing. Keep the existing validation rules, form layout, and backend payloads unchanged.

## Behavior

- Show the first invalid field as a specific `uni.showToast` message.
- Split combined title and subject validation.
- Split parent grade and budget validation into actionable messages.
- Split teacher hourly price and service radius validation into actionable messages.
- Distinguish empty mobile numbers from invalid mobile formats.

## Verification

Add a Node source regression check that requires each specific message and rejects the old combined messages. Run all tutor regression scripts and `git diff --check`.
