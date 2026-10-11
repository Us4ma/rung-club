# Gameplay refinement QA

## Executed checks

| Check | Result |
|---|---|
| Vitest | 113 passing tests across 13 files |
| Browser / responsive suite | 52 passing checks across existing and new flows |
| Authoritative multiplayer integration | 4 passing scenarios |
| TypeScript / production Vite build | Passed |
| Cloudflare Worker typecheck and dry-run package | Passed |
| Capacitor Android asset synchronization | Passed; not an APK build |
| Deterministic bot benchmark | 400 games; advanced team won 302 (75.5%), mean 9.25 collected Sars |

The benchmark compares paired seats against random legal play. It does not establish human playing strength or a statistical guarantee. All core full-deal tests enforce card and Sar conservation.

## Screenshot matrix

These are captures of the running application, including a real conserved tutorial deal and regular practice. The chooser uses actual opening cards; the fifth-Sar screenshot follows four legal completed Sars. No UI mockup or flattened reference screenshot is used.

| Viewport | Regular 13-card practice | Rung selection | Fifth-Sar event |
|---|---|---|---|
| 1920 × 1080 | [Practice](qa-gameplay/1920x1080-practice.webp) | [Chooser](qa-gameplay/1920x1080-rung.webp) | [Fifth](qa-gameplay/1920x1080-fifth.webp) |
| 1366 × 768 | [Practice](qa-gameplay/1366x768-practice.webp) | [Chooser](qa-gameplay/1366x768-rung.webp) | [Fifth](qa-gameplay/1366x768-fifth.webp) |
| 390 × 844 | [Practice](qa-gameplay/390x844-practice.webp) | [Chooser](qa-gameplay/390x844-rung.webp) | [Fifth](qa-gameplay/390x844-fifth.webp) |
| 360 × 800 | [Practice](qa-gameplay/360x800-practice.webp) | [Chooser](qa-gameplay/360x800-rung.webp) | [Fifth](qa-gameplay/360x800-fifth.webp) |
| 844 × 390 | [Practice](qa-gameplay/844x390-practice.webp) | [Chooser](qa-gameplay/844x390-rung.webp) | [Fifth](qa-gameplay/844x390-fifth.webp) |
| 932 × 430 | [Practice](qa-gameplay/932x430-practice.webp) | [Chooser](qa-gameplay/932x430-rung.webp) | [Fifth](qa-gameplay/932x430-fifth.webp) |

[Desktop live authoritative timer](qa-gameplay/desktop-live-timer.webp) · [Portrait live timer](qa-gameplay/portrait-live-timer.webp)

The full-size captures are optimized to WebP without resizing. Browser tests generate PNG originals; conversion is an export step for repository size.

## Double-tap and server evidence

`tests/visual/gameplay.spec.ts` executes same-card quick play at all six sizes, verifies one card leaves the hand, then completes the five-Sar guided sequence through ordinary commands. A separate test disables quick play and verifies two clicks only select until Play is pressed. Regular practice validates 13 cards, selection, accessible control sizes and geometrically separate Play/hand areas. Landscape uses a side action column, portrait a lower action row.

`tests/visual/input-network.spec.ts` sends an intentionally rejected first play through the actual local authoritative server, checks selection recovery, then delays the next transmission by 350 ms. Repeated taps while pending send no additional command; exactly one accepted card leaves the hand.

`tests/gameplay-presentation.test.tsx` covers different second taps, canceled swipes, wrong turns, revision invalidation, confirmation preference, hidden-suit announcement redaction, fifth-Sar timing, collection score transitions, queue priority, stale turn removal and rematch cleanup.

Existing drag/drop, keyboard, tutorial, username restoration, Google/email protection, settings, six avatars, collection, readiness, duplicate commands, disconnect, timeout, reconnect and Band secrecy checks remain in the suites. Real-server timer tests verify the same deadline after reconnect, rather than restarting a client clock.

## Visual corrections made after inspection

- Moved the responsive stylesheet after the older visual layers so the compact HUD applies consistently.
- Replaced bright wall lamps with the existing original woven-emerald/walnut surface.
- Moved dealer speech beside her face and kept the hand clear of the chooser.
- Kept resting cards bright; only active-turn illegal cards dim.
- Gold Play is aligned right; icon Sort and secondary controls align left.
- Integrated countdown progress into the active avatar, with readable seconds and urgent final seconds.
- Displayed the temporary Ace effective-rank badge separately from its physical card.

## Remaining verification limits

- No Android APK was generated: the environment cannot download the free Gradle distribution; physical Android devices and real cutouts are not certified by viewport tests. Capacitor sync succeeded.
- Cloudflare production room rollout cannot be independently verified from this workspace (its edge rejects workspace requests). Local authoritative multiplayer, Worker typechecking and dry-run packaging passed. The server must run this same shared core revision for the optional-trump change to take effect online.
- Guided lessons use vertical scrolling at short landscape heights; regular practice uses the compact landscape composition shown above.
- Production voice lines remain optional future assets. Text announcements and existing sound controls work without paid TTS.
- The existing lazy-loaded Phaser chunk still triggers Vite's large-chunk advisory. It is loaded on entering a table, not required to paint the loading screen.
