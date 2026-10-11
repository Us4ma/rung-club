# Rung Club — playable implementation, v0.1

A zero-payment browser practice game and development multiplayer implementation with a shared TypeScript rules engine. This is **not a production-complete release of every feature in the master brief**.

**Play immediately:** open `playable/Rung-Club.html`. For local four-player play, follow `docs/SETUP.md`.

Implemented: Open/Band 5-Sar Double Rung; versioned provisional rules; protected sealed trump; temporal trump resolution; mandatory superior-trump policy; Ace-on-Ace; individual pile collection; bounded redeals; Kot classification; three redacted bot profiles; six deterministic interactive lesson fixtures; responsive emerald/wood/brass table; touch/click/drag-end/keyboard buttons; local profile/XP; rules, settings, collection, results; local cookie identities; private/quick casual rooms, readiness, labelled bots, acknowledgements, sequence/revision/match IDs, idempotency, reconnect, rematch votes and persistence. Cloud Worker source adds Firebase verification, hashed revocable sessions, D1 result/reward ledger, daily eligibility, guarded cosmetic purchases, rate limits and SQLite-backed hibernating room objects.

**Important unfinished or unverified work:** live cloud authentication/account linking, cloud deployment, browser visual/performance QA, native APK/device verification, full friend system (invite codes exist), advanced interactive lessons beyond the basic fixtures (written explanations exist), final art/audio polish, real ad providers/consent, multideal courts/scoring/dealer rotation and other regional scoring presets, durable room restart/hibernation fault testing, quota-exhaustion graceful recovery, Android native Google linking, and generalization of room runtime to additional game families. Cloud XP/history/unique name editing are wired through profile endpoints but require live cloud verification. Cosmetic shop is disabled. No ranked mode is present.

See `docs/VALIDATION.md` for actual checks, `docs/RULE_DECISIONS.md` for assumptions, `docs/SECURITY.md` for trust boundaries, and `docs/ASSETS.md` for ownership and audio requirements. No paid services or purchased assets were used. Ads and economy default off. No app store publication or public deployment occurred.

## Monorepo

- `apps/web`: React menus and table UI, lazy Phaser felt canvas, PWA
- `apps/android`: generated Capacitor Android wrapper
- `apps/server`: authoritative local server, Worker/Durable Object, SQL schema
- `packages/core`: rules, game adapter contract and tutorial fixtures
- `packages/ai`: information-limited heuristics
- `packages/protocol`: validated commands and economy SQL
- `packages/ui`: branding, audio/ad interfaces and original visuals
- `tests`: core/security/invariants, economy, UI and multiplayer
- `docs`: setup, decisions, QA, assets and limitations
- `dist`, `worker-dist`, `playable`: generated delivery artifacts

MIT for original project code. Third-party libraries retain their own licenses.

## First-time experience update

New identities receive a skippable lobby introduction and a continuous, playable five-Sar guided deal. Regular matches use a highest-rank opening draw. Online turns and Rung calling use persisted 20-second deadlines with legal automatic actions; reconnect keeps the same deadline. Band Rung unlocks at Level 5 (400 XP), with server-ledger eligibility for online rooms. Local practice XP stays on the device. Tutorial replay and optional advanced examples are available in Settings/Rules.

See [implementation and limitations](docs/FIRST_TIME_EXPERIENCE.md), [rule decisions](docs/RULE_DECISIONS.md), and [release QA evidence](docs/art/EXPERIENCE_QA.md). Run `npm test`, `npm run test:e2e`, `npm run test:visual`, `npm run build` and `npm run typecheck:worker`. Android: `npm run android:sync`, then use free Android Studio to generate a debug APK; Google Play publishing is deferred.

Gameplay refinement: [implementation notes](docs/GAMEPLAY_REFINEMENT.md), [rules decisions](docs/RULE_DECISIONS.md), and [screenshot / test evidence](docs/art/GAMEPLAY_QA.md). The foundation now allows optional cutting when void; regional superior-Rung and Band reveal obligations remain explicit policies. Table quick play can be disabled in Settings.
