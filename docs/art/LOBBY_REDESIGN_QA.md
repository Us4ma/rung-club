# Rung Club lobby redesign — 12 October 2026

The lobby now uses three illustrated, interactive game cards: ruby Open Rung, royal-blue Band Rung, and teal Practice. Open Rung retains the existing quick-match action. The upper-left HUD retains avatar, username, level and XP; Settings stays upper right, with empty top-bar space reserved for future functional features. There are no currency, Friends or advertising placeholders. Economy code and player data are untouched.

The existing female dealer and room are reused, with a smaller side composition on desktop/landscape and an independent short host area on portrait. The oversized hero banner is removed. Private rooms, learning, profile, collection, settings, first-time onboarding and the Level 5 Band gate retain real navigation and callbacks. New DOM controls sit above independent illustrations; no reference screenshot is used as a UI background.

## Screenshot evidence

- [Desktop, 1920 × 1080](qa-lobby-redesign/desktop.webp)
- [Mobile portrait, 390 × 844](qa-lobby-redesign/mobile-portrait.webp)
- [Mobile landscape, 844 × 390](qa-lobby-redesign/mobile-landscape.webp)

Also tested at 1366 × 768, 412 × 924 and 360 × 800. Reviewed against the supplied desktop and mobile references. Corrected a legacy felt-background override that hid the room, excess card spacing on shorter screens, hover offsets in neutral screenshot captures, small locked-action text and an FTUE skip control overlapping Settings. Primary actions remain at least 44 px high and visible; no horizontal overflow was detected at the six target sizes. Landscape navigation also retains 44 px touch targets. Reduced motion and the existing Animations preference remain respected.

## Verification

- **156 unit tests passed**, including six new lobby tests for the three-card structure, explicit Open matchmaking, locked Band at 399 XP, unlocked Band at 400 XP, practice/private/learning callbacks and first-time tutorial routing. Rechecked the six lobby cases after final styling/copy adjustments.
- **All 68 distinct browser cases validated.** The full run passed 65 cases; three tutorial cases initially referenced the retired welcome sentence. Updated those text assertions and reran all six tutorial cases successfully. The final six-viewport lobby pass also succeeded after the last layout refinement.
- **Production build passed**; existing lazy Phaser chunk-size warning remains.
- **Capacitor Android assets synced**. Responsive browser emulation is verified; no APK or physical Android-device execution is claimed.
- Existing authentication, account lifecycle, profile/collection, settings dismissal, card input, Rung/Band gameplay, collection, latency, authoritative timers and reconnection regression cases passed. No backend, rules-engine, economy or persistent-data edits were made.

## Implementation and assets

`apps/web/lobby.tsx`, lobby-only `apps/web/lobby.css`, and the lobby Header in `apps/web/main.tsx` contain the presentation changes. Tests update the former four-card/Quick Play selectors to the intentional three-card Open Rung layout.

Six responsive alpha WebP files are saved under `apps/web/public/art/lobby/` (389.5 KiB total). [Generation prompts and provenance](LOBBY_ASSET_PROMPTS.md) document the built-in tool and separate illustration subjects. [Asset manifest](asset-manifest.json) records source, usage, dimensions, bytes and SHA-256 values. No new production dependency, paid service, store, currency or ad integration was introduced.
