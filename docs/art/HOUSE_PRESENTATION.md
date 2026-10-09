# Card House — first working presentation release

Scope: the existing Rung Club lobby and table, using the approved `Rung Club Card House UI Concept Board(1).png`. Login work already in progress is retained; remaining screens are not redesigned in this step. No dependency, cloud plan, game policy, economy or advertising changes.

## Asset audit and decisions

| Item | Decision | Reason |
| --- | --- | --- |
| Generated lounge and ornamental table | Retain in repository; remove from active lobby/table | Too decorative and hard to scale around live gameplay |
| Approved female dealer | Keep in lobby; add a seated transparent derivative at table | Preserve identity; silhouette stays out of the active trick and seats |
| Original portrait court cards | Retain; replace active front deck with 52 original SVG faces | Larger corners and suit marks remain clear on small displays |
| 12 global avatars | Keep | Diverse roster and consistent circular frame |
| Card backs, brass buttons, badges, preset emotes | Keep where functional | Existing vector elements fit the visual direction |
| Rank, shop, wallet balances in reference | Do not imitate with invented values | Economy remains disabled; show actual local practice XP instead |

Original code-authored runtime surfaces: `apps/web/public/art/house/table.svg`, `club-wall.svg`, `cards/*.svg`. The table has independently rendered wood, felt weave and rail layers; UI objects are live DOM. The wall is original scalable slats and warm lamps, not an AI room screenshot. No screenshot is loaded into the game.

New runtime asset total: 89,795 bytes (52 SVG cards, table and wall SVGs, seated WebP dealer). Existing assets are lazy-loaded as used. Sources, sizes, hashes and ownership appear in `asset-manifest.json`. Vector code art uses the project MIT license. User-supplied/generated character derivatives follow `ASSET_LICENSE.md`.

## Working screen composition

- Desktop lobby: compact sidebar, brand/dealer banner, four independent mode tiles, private-room and interactive tutorial shortcuts. Actual XP indicator; no pretend ranks or currency. Each mode has a real focusable selector and separate play action.
- Portrait lobby: navigation collapses, three mode tiles and a wide practice tile; quick shortcuts and bottom navigation remain touchable. Private-room code controls expand on demand.
- Desktop table: four true player seats, paired partners opposite at the same horizontal position. The host is a noninteractive layer behind the top rail and clearly labelled Dealer. No fifth seat is represented.
- Portrait table: four compact score panels, readable bot/partner/card labels, central trick, two rows of 13 individually selectable cards, and controls below the hand. Below 361px, the hand uses larger cards with horizontal swipe access.
- Landscape table: scene and hand on the left, compact score/actions column on the right. Short tutorial layouts may scroll; there is no forced orientation.
- Reactions expand into their own control row rather than covering cards. All existing server-permitted preset messages are retained.

## Reference comparison and corrections

Real Chromium screenshots were reviewed twice against the supplied board. The first pass had oversized decorative empty space, uneven mode tile text gaps, small corner ranks, tiny opponent labels, and an overflowing chat icon. The final pass constrains the table width, aligns the mode tile content, replaces active card faces with clear vectors, increases seat label sizes, and gives the reaction button a fixed 44px target.

Intentional differences from the board: exactly four players, no invented wallet/rank values, and two-row phone hands instead of 13 cards squeezed into sub-44px hit targets. The background is a lighter original vector composition, with no baked-in furniture, card piles, seats or UI. The approved reference remains a quality/composition target, not a pixel-identical reproduction.

## Gameplay interaction fixes

A confirmed bug in the existing desktop drag handling played a card on `dragend`, even after a cancelled drop. Cards now carry their ID on `dragstart`, and only a drop of a legal owned card into the central trick submits the existing action. Validation remains authoritative. Tap, select/Play, double click, keyboard Enter and drag-to-trick are supported.

Valid Rung-limit redeals now show an explanatory message during renewed trump selection. The policy and all scoring are unchanged; the UI does not reveal hidden suits or private holdings. Browser tests handle legitimate reshuffles instead of assuming every first trump selection produces a valid deal.

## Evidence and checks

Screenshots in `qa-house/` come from the running app, not mockups:

- `desktop-lobby.webp` — 1440 × 1000
- `portrait-lobby.webp` — 390 × 844
- `desktop-table.webp` — 1440 × 1000, actual trick in progress
- `portrait-table.webp` — 390 × 844, actual trick in progress
- `landscape-table.webp` — 844 × 390, actual trick in progress

Checks: 44 Vitest unit/UI/auth tests, 14 real Chromium presentation checks, and 2 HTTP/WebSocket multiplayer integration tests. Responsive checks include 320 × 640. Tests cover four seats, host clearance, 13-card hand selection, keyboard play, no horizontal document overflow, reaction clearance, private-code input, Band Rung/tutorial flows, deck decoding, guest reload/sign-out and cancelled/valid drag behavior.

`npm run build`, `npm run typecheck:worker`, and `npm run android:sync` pass. Core rules, AI, protocol, server source and persistent schema have no changes in this release. No APK or physical Android performance test is claimed. Live Firebase providers and Cloudflare online room availability remain outside these local checks; see `../LOGIN_STEP.md`.

Reproduce:

```sh
npm ci
npm run dev
npm run test
npm run test:e2e
npx playwright install chromium
npm run test:visual
npm run build
npm run typecheck:worker
npm run android:sync
```

For this workspace's temporary free Chromium binary, browser tests used `BROWSER_EXECUTABLE_PATH=/tmp/rung-chromium npm run test:visual`. It is QA tooling only, not a runtime dependency.

## Seated dealer generation

Built-in image-generation tool, not a paid external inference API. Runtime file: `apps/web/public/art/characters/dealer-seated.webp` (640 × 480, transparent RGBA). Edit input: existing approved female dealer; supplied concept board used only as pose/composition reference.

Final prompt:

> Use case: identity-preserve. Asset type: isolated decorative seated female dealer sprite for Rung Club card game, transparent background. Image 1 is the edit target: preserve her exact face, hair, emerald waistcoat, white shirt and brass accents. Image 2 is composition reference only for the seated woman behind the desktop table. Change Image 1 pose to seated front-facing, visible from waist up, both forearms resting calmly in front on an invisible table edge, hands together, warm friendly expression. Clean polished painted game illustration, restrained details, clear silhouette at 130px display height. Complete head, arms and hands within frame with small transparent margin. NO table, no furniture, no room, no cards, no text, no labels, no UI, no other people, no shadow rectangle. Real alpha transparency.
