# Local P0 Flow Design

## Goal

Build a reliable local debugging chain for the tutoring platform, with the mobile app as the primary product surface. The first acceptance target is the P0 mobile loop:

1. Login or register.
2. Select parent or teacher identity.
3. Complete teacher certification and profile basics.
4. Publish a parent demand or teacher resume.
5. Browse and filter the square.
6. Open details.
7. Spend points to view contact information.
8. Review favorites, browse history, contact records, and evaluations.

The admin frontend is in scope only where it supports this loop: login, menu access, certification review, publish review, point or data correction, and basic operational inspection.

## Current Context

The workspace contains three independent repositories:

- `zfwl`: Spring Boot backend with `yudao-module-tutor` already integrated.
- `zlwl-vue`: Vue 3 admin frontend with existing tutor APIs and views.
- `zfwl-unapp`: uni-app mobile frontend with tutor pages, tests, and prior local-state cleanup work.

The mobile and admin frontends currently have environment values that can point at online services. The backend local profile also contains online MySQL and Redis addresses. This makes local debugging data-dependent and risks touching shared online state.

## Recommended Approach

Use a local-first P0 loop:

- Run backend locally on `48080`.
- Run admin frontend locally on `80` or the next available port.
- Run mobile H5 locally on `3000`.
- Point mobile and admin development environments to the local backend.
- Make backend local configuration use controllable local infrastructure where available, or document any external dependency that cannot be replaced during this pass.

This approach gives the fastest feedback on real API contracts, auth state, tenant headers, review status transitions, point deduction behavior, and mobile UX.

## Environment Design

### Backend

Use the `local` Spring profile as the single backend target for this pass. The backend must expose:

- `/app-api` for mobile.
- `/admin-api` for admin.
- Swagger or OpenAPI endpoints for API inspection if startup succeeds.

The preferred dependency target is local MySQL and local Redis. If those services are unavailable, the implementation should avoid silently using online data. The result must clearly document which dependency target was used.

### Admin Frontend

Use `pnpm dev` or the existing local dev script. The local mode should resolve API calls to:

```text
http://localhost:48080/admin-api
```

The admin frontend is not the main polish target. It only needs to support review and correction actions required by the mobile loop.

### Mobile Frontend

Use `npm run dev:h5` for browser-based inspection and `npm run build:mp-weixin` for WeChat mini-program build validation. Development mode should resolve API calls to:

```text
http://localhost:48080/app-api
```

The H5 dev server is also the replacement for the visual companion in this Windows environment, because the companion shell script requires WSL/bash support that is not currently available.

## Mobile UX Design

Focus UI review on high-frequency P0 pages:

- Home: role-aware entry points, city/location state, clear next action.
- Square: filters, role visibility, loading and empty states, card readability.
- Publish: role-specific forms, validation messages, address/location fields, submit state.
- Detail: content hierarchy, point cost prompt, contact unlock state, action bar, owner view.
- Mine: profile completion, certification status, points, posts, history, favorites, contacts.

Polish criteria:

- Primary actions remain visible and safe-area aware.
- Long names, subjects, addresses, and descriptions wrap cleanly.
- Empty, loading, unauthenticated, and failed states explain the next useful action.
- Point deduction prompts use backend-returned cost and repeat-view status.
- Local demo fallback must not contaminate real numeric server IDs.

## Data Flow

1. Mobile login stores token and tenant context through the existing request layer.
2. Identity/profile APIs determine which publish and mine actions are available.
3. Publish APIs create demand or resume records in pending review state.
4. Admin review updates certification and publish status.
5. Mobile square and detail APIs read approved data.
6. Contact unlock calls backend point deduction logic and records contact history.
7. Favorites, browse history, contact records, and evaluations read server data first, with local fallback only for non-server demo objects.

## Error Handling

The local pass should make failures visible rather than hiding them behind mock data:

- Backend unavailable: mobile/admin show request failure and keep page stable.
- Unauthenticated: actions route to login or open auth modal.
- Not certified: teacher publish shows certification guidance.
- Pending review: published content appears in mine, but not as approved public content.
- Insufficient points: contact unlock explains recharge or point task path.
- API schema mismatch: normalize only compatible fields, then add focused tests.

## Verification Plan

Minimum verification before implementation is considered complete:

- Backend tutor module compile or server startup check.
- Mobile `npm test`.
- Mobile H5 dev server smoke check in browser.
- Mobile H5 build or WeChat mini-program build check, depending on touched surface.
- Admin type or lint check only if admin code changes.
- Manual P0 walkthrough notes with exact local URLs and any credentials or seed data used.

Known pre-existing risk:

- Full admin `ts:check` may still fail on unrelated historical modules. If this remains true, record the failure and run the smallest tutor/admin-specific check available.

## Out Of Scope For This Pass

- Online payment provider callbacks.
- Full VIP, invite, trial lesson, escrow, and advanced growth loops.
- Production deployment.
- Broad admin UI redesign.
- Refactoring unrelated Yudao modules.

## Acceptance Criteria

- The mobile P0 loop can be executed against a controlled local backend target, or any remaining external dependency is explicitly documented.
- Mobile H5 pages involved in the loop render cleanly at common mobile viewport sizes.
- Admin support pages can complete the required review or correction steps.
- Environment files no longer default local development to the online API for this P0 workflow.
- Verification commands and results are recorded in the final handoff.
