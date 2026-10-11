# First-time experience release QA

Verified in the existing Rung Club project. No new paid services or assets were added.

| Check | Executed result |
|---|---|
| `npm test` | **101 passed**, 11 test files |
| `npm run test:visual` | **38 passed**, actual headless Chromium browser |
| `npm run test:e2e` | **4 passed**, actual local HTTP/WebSocket server, including disconnect across a 20s deadline |
| `npm run build` | TypeScript and Vite production build passed |
| `npm run typecheck:worker` | Worker and room test type checks passed |
| Wrangler `deploy --dry-run` | Worker bundle/bindings verified; no deployment claimed |
| `npm run android:sync` | Production web assets and native plugin configuration synchronized |
| `./gradlew assembleDebug --no-daemon` | **Blocked:** Gradle distribution download failed with `Network is unreachable`; no APK generated |

The full browser suite covers 1440px desktop, 390px portrait, 844px landscape and 320px small-phone layouts; real card selection/drop, readable 13-card hands, settings/navigation, account loading, tutorial completion/skip, reduced motion, Band lock, opening animation interruption and server deadline restoration. The reconnect tests intentionally close sockets; Vite may log ECONNRESET during that exercise. These are test-induced disconnects, not an unexpected gameplay exception.

Core regressions retain the previous Rung/Band, collection, Ace-on-Ace, Senior/Bhaag, hidden-trump, economy and authentication tests. New cases cover highest-rank ties, exhausted/repeated comparison draws, full-deck conservation, scripted legal five-Sar collection, timer stability/expiry/idempotency, actual Cloudflare room eligibility/restore logic using platform mocks, UID-scoped terminal onboarding and server-ledger unlock acknowledgment.

## Actual captured screenshots

These are screenshots of the running software, optimized to WebP after capture. No generated mockup is presented as an application screenshot.

- [Desktop welcome lobby](qa-experience/desktop-welcome.webp)
- [Portrait welcome lobby](qa-experience/portrait-welcome.webp)
- [Desktop guided table](qa-experience/desktop-guided-table.webp)
- [Portrait guided table](qa-experience/portrait-guided-table.webp)
- [Landscape guided table](qa-experience/landscape-guided-table.webp)
- [Portrait five-Sar completion](qa-experience/portrait-tutorial-complete.webp)
- [Band lock explanation](qa-experience/portrait-band-locked.webp)
- [Desktop authoritative timer](qa-experience/desktop-live-timer.webp)
- [Portrait authoritative timer](qa-experience/portrait-live-timer.webp)

The visual review corrected Skip/HUD overlap, missing-card captures before image load, premature card pointers, opening overlays surviving interrupted animation, and reconnect missing during Rung calling. Dealer artwork remains the approved limited-pose artwork; no full skeletal character rig is claimed. Portrait cards are independently selectable in two rows; narrow phones retain scrolling. Landscape tutorial adds instructional height and may scroll on short displays, while cards and confirmation remain reachable.

## Operational limits

Secure online identities, ledger XP and rooms require the existing configured Firebase/Cloudflare services. Local tutorial/practice work without cloud credentials. The development server deliberately does not invent trusted cloud XP; Band room creation is rejected for those development sessions. Local practice levels cannot unlock online rooms.

Live Cloudflare verification from this workspace remains unavailable (previous requests were blocked by its edge). Worker compilation, dry-run packaging and room tests are verified; they are not substitutes for a live authenticated four-device session. Android hardware/rendering and an installable APK remain unverified because the native build was blocked. Production ads/economy remain disabled. No billing or app-store action was performed.

See [implementation details](../FIRST_TIME_EXPERIENCE.md) and [versioned rule decisions](../RULE_DECISIONS.md) for provisional policies and exact scope.
