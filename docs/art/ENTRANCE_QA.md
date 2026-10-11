# Premium account entrance

The entrance uses the approved desktop and portrait compositions: existing female dealer at center-left, left headline, warm owner-supplied lounge, foreground emerald felt and floating brass panel. It does not use either approved screenshot as UI artwork. Text, buttons, form fields and error recovery are live React elements. No new dependencies, paid services or artwork were added.

## Files and layers

- `apps/web/login.tsx`: welcome / email / signup states, accessible panel, focus management, duplicate-action guard and existing authentication adapter calls.
- `apps/web/main.tsx`: restore local guest sessions through the branded loading gate before deciding the entrance/lobby, avoiding an offline login flash.
- `apps/web/login.css`: independent room, host, CSS felt table, brass frame, crest, typography, responsive layouts, interactive states and reduced motion.
- `apps/web/arcade.css`: scope lobby button styling away from login and remove obsolete entry overrides.
- Existing `/art/backgrounds/lounge.webp` (257,334 bytes) and `/art/characters/dealer-female.webp` (175,570 bytes): reused WebP files; sources and ownership remain in `asset-manifest.json` and `ASSET_LICENSE.md`.
- Panel, felt, branding and flourishes are code-drawn; Google mark identifies its sign-in provider. No full-screen mockup or fake buttons.

## Authentication scope

The adapter, account backend, unique username reservation, session restoration gate, guest linking, tutorial eligibility and all game rules are preserved. Initial welcome hides email/password. Email and signup open in the same shell. Restored identities continue through the existing branded checking-seat screen before profile/username decisions.

Registration still creates or links the Firebase identity, then reserves the username through the authoritative profile service. A conflict remains on username setup and permits retry; registration does not silently overwrite another user's name. Guest accounts remain device-bound until linked.

Tests use controlled provider adapters and local services. They do not establish that production Firebase provider configuration or email delivery is correct. The existing Android adapter rejects browser popup OAuth with a helpful message; native Google integration remains a separate existing limitation. Email and guest entry remain available in the wrapper. Android asset synchronization is not an APK build or device test.

## Responsive evidence

`qa-entrance/` contains actual Chromium screenshots of welcome, email and signup at 1920×1080, 1366×768, 412×924, 390×844, 360×800 and 844×390. Welcome must fit without page scrolling at these six sizes. Forms can scroll when needed, especially when a mobile keyboard reduces the usable viewport; focus, fields and submit remain reachable. Reduced viewport checks simulate keyboard occlusion and are not a physical Android keyboard test.

Compared with the supplied references, the recognizable dealer and gold/emerald hierarchy are preserved. The existing lounge has more ornate lanterns than the reference's quieter card room. The foreground uses scalable felt and walnut layers rather than illustrative poker chips; the game remains non-wagering. Screenshots drove fixes to inherited button styles, entrance capture timing, desktop vertical overflow and narrow-phone hero height.

## Validation

- `npm test`: 127 tests across 14 files passed. Includes new welcome/form/provider/error/loading tests, anonymous creation and slow restoration, existing duplicate username retry and guest linking tests.
- `npm run test:e2e`: all 4 authoritative multiplayer regression tests passed.
- `npm run build`: TypeScript and production Vite build passed. Existing lazy Phaser chunk size advisory remains; Phaser is not loaded for the entrance.
- `npm run typecheck:worker`: passed.
- `npm run android:sync`: passed; web assets copied to the existing wrapper. No APK generated in this task.
- Full Chromium browser suite: 58 tests passed in 4.9 minutes, covering entrance, tutorials, 13-card hand, settings, profile, collection, loading, server rejection/latency, timers and reconnect. All 6 entrance checks passed again after the final foreground layer polish. Returning local guest restoration is additionally covered by a new unit regression and a final entrance/login browser rerun.


## Overlap correction — October 11

The reported username hint overlap came from a later shared `.username-note` negative margin. Login now scopes this selector to the form, makes inputs block elements and provides a 12px hint gap, including clearance for the focus ring. The input also identifies its hint with `aria-describedby`.

The upper caption now belongs to the authentication panel and stays 44px above its frame; its bottom remains at least 8px above the crest. It follows the panel as form height changes, rather than remaining at a fixed screen coordinate. Mobile/short landscape layouts retain their existing hidden caption.

Verification: 127 unit tests, production build and all 6 responsive entrance checks passed. Browser checks now assert actual hint/input and caption/crest separation. Updated screenshot evidence: [desktop welcome](qa-overlap/desktop-welcome.webp), [desktop signup](qa-overlap/desktop-signup.webp), [mobile signup](qa-overlap/mobile-signup.webp). Authentication logic and gameplay rules are unchanged.
