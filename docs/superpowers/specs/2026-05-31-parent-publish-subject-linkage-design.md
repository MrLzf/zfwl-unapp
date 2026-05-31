# Parent Publish Subject Linkage Design

## Scope

Update the parent demand form on `pages/index/publish.vue`. Teacher publishing and the parent profile page remain unchanged.

## Behavior

- Replace the `成人` grade option with `其他`.
- Replace the parent subject free-text input with a picker.
- Subject options depend on the selected grade.
- Each subject list includes `其他` as a fallback.
- When the grade changes, keep the selected subject only if it is valid for the new grade. Otherwise clear it.
- Keep submitting `subjects` as the existing string field so the backend contract remains unchanged.

## Subject Rules

- `小学`: `语文`, `数学`, `英语`, `编程`, `钢琴`, `美术`, `其他`
- `初中`: `语文`, `数学`, `英语`, `物理`, `化学`, `生物`, `编程`, `其他`
- `高中`: `语文`, `数学`, `英语`, `物理`, `化学`, `生物`, `编程`, `其他`
- `其他`: `其他`

## Verification

Add a Node source regression check for the shared mapping and parent publish picker wiring. Run the existing tutor regression scripts and `git diff --check`.
