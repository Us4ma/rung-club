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

## Owner-requested visual correction, 12 October 2026

The HUD now uses a serif spade wordmark and a compact identity plaque. Automatically generated Guest-UID labels display as Guest in the HUD, while stored identity/name data remains intact. The Open Rung illustration is replaced by plain code-native ivory cards with rank/suit marks, without royal portraits. Card descriptions now follow the approved reference. A separate textured felt/walnut/brass foreground layer covers the dealer's lower body and includes decorative gold coin stacks and a card deck; these are scenery, not an economy balance. The lobby bottom navigation and footer are removed. Collection and rules navigation remain available inside Profile, reached from the HUD.

Production compilation and Android web-asset sync were performed to publish the update. The owner explicitly requested no tests or screenshot validation for this correction; previous screenshots and test counts above describe the earlier revision, not this follow-up.

### Viewport-height correction

The lobby now occupies `100dvh`, with mode artwork using the available height and a shallower foreground table clipped to the scene. Decorative table overflow cannot enlarge the page. Private-room forms retain internal scrolling when expanded or when the keyboard reduces space. No tests or screenshots were run for this owner-reviewed correction; production compilation is required for publishing.


## Cutoff correction and mobile validation

Removed clipping at the inset lobby grid while retaining viewport-level bounds. The foreground table now fills the screen width and bottom edge; decorative cards sit above the lower boundary. Portrait layouts use compact mode cards and a larger dealer hero, with visible descriptions and smaller titles on narrow phones.

All eight responsive browser cases passed: 1920×1080, 1366×768, 412×924, 390×844, 360×800, 320×640, 844×390 and 932×430. Checks cover full-width table, card decoration bounds, visible mode descriptions and titles, minimum 44px primary buttons, shortcut visibility, no outer scrolling, Band unlock and private-room navigation. Fresh desktop, portrait, landscape and small-phone screenshots are stored in qa-lobby-redesign. Production build and Capacitor asset synchronization passed. These are browser-emulated layouts, not physical Android-device tests. Gameplay and authentication logic were unchanged.


## Mobile reference proportion correction

Compared against the supplied Mobile Lobby Showcase(2) portrait and landscape reference. The previous cards were vertically stretched despite passing viewport checks. Portrait card height now follows screen width (230–286px), rather than viewport height; the 390px layout is about 261px tall instead of 322px. Reserved ribbon/progress spacing is compact, descriptions remain readable, and buttons retain 44px targets. The existing dealer is larger in portrait and landscape. Desktop panels are capped to avoid empty internal space.

Eight responsive tests pass, including new mobile card aspect-ratio and viewport-height assertions. Production build and Capacitor sync pass. Screenshot evidence refreshed for desktop, portrait, landscape and 320px phones. Physical Android device testing remains outstanding. Existing source artwork is retained; this is a layout correction, not an exact recreation of the reference illustration.


## Decorative cards and chips on felt

Fixed the mobile foreground rail height independently of the full table area. Moved and scaled the decorative cards and chips below the curved felt boundary at desktop, portrait and landscape sizes. Fresh screenshots show them resting on the table rather than floating outside its edge. All eight responsive cases passed, including a new check against the actual SVG felt curve for every decorative card and chip.
