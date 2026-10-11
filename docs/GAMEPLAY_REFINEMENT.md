# Gameplay refinement

The existing monorepo and account storage are retained. No new service or dependency is required.

## Rules

`packages/core/index.ts` now defaults to `double-sar-v2-optional-trump`: follow the **original** led suit when held; otherwise all hand cards are legal. An earlier cut never forces a later cut. `superior: off` is the foundation. Explicit `opponent-only` / `always` restrict voluntary trump choices when a higher trump exists, while preserving non-trump discards. Explicit `voidTrump: compulsory` retains the earlier regional preset. Old saved policies lacking the new field use optional cutting with their existing superior policy.

Band reveal requester obligations remain separate. Human validation, redacted views, bots, tutorials and timeout commands all consume shared `legal()`. Five-Sar collection, physical/effective Ace separation, Bhaag classification and final collection are unchanged.

Foundation: https://www.pagat.com/whist/rang.html (Play, Double Sir, Hidden Rung). The source's other regional scoring conventions are not imported.

## Reusable presentation

`apps/web/gameplay.tsx` contains the input hook, compact HUD, central Rung chooser, event producer / dealer queue, table preferences, trick transitions and hand sorting motion. `gameplay.css` owns its responsive layer. `main.tsx` connects these components to real state and ordinary commands. `experience.tsx` keeps existing dealer/deal presentation and exposes accessible authoritative timer values.

Single tap selects; a second same-card tap within 320 ms plays when quick play is enabled. Settings persist the confirmation preference. Pointer movement exceeding ten pixels and canceled drags cancel the quick-play gesture. State revision changes invalidate the previous tap. One pending network command blocks repeat submissions until state advances; rejection retains a still-legal selected card. Server command IDs and sequences remain authoritative.

Dealer events use only the local redacted view. Band caller-private trump is never announced before reveal. Initial/reconnect snapshots seed the observer rather than replaying historical announcements. Events have stable match/event identifiers and priority. Optional `voiceKey` identifiers prepare a future licensed voice-line integration without TTS services.

The fifth-Sar announcement is produced only when history advances to four completed Sars; it is presentation, never a collection award. The collection message requires an authoritative team-score increase.

## Evidence and limitations

See `docs/art/GAMEPLAY_QA.md` for executed validation and application captures. Browser viewport checks are not physical Android device certification. Android debug assembly still requires access to the free Gradle distribution and Android SDK. No store publication or paid service is needed.
