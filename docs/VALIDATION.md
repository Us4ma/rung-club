# Validation — 2026-10-09

Status: playable v0.1, not a production-complete release.

| Check | Actual result |
|---|---|
| Vitest | 38 tests passed across 4 files |
| Full-deal invariant coverage | 600 complete deals across Open/Band and three skills; 52-card and Sar conservation checked after each action |
| Tutorial fixtures | All six conserve 52 cards and can finish a complete deal |
| Rules boundaries | Opening restriction, personal/team streak distinction, reset, 12/13 collection, overtrumping, partner exemption, Ace downgrade/effective tie, reveal rights/no-trump and privacy |
| Economy | Real in-memory SQLite: repeated reward and repeated purchase do not duplicate currency/debit; insufficient balance rejected |
| React interaction QA | DOM simulation: first-launch skip, choose trump, select/play card, follow-suit lesson, profile persistence |
| Playwright | 2 API/WebSocket integration tests passed; four separate cookie identities, readiness/start, hidden state redaction, duplicate acknowledgement, forged turn, reconnect and hostile origin |
| Browser build | TypeScript and Vite production build passed |
| Worker build | Separate TypeScript check and earlier Wrangler dry-run bundle passed. Final Wrangler rerun blocked by automatic approval review for possible external disclosure; final Worker bundled locally with esbuild. No deployment performed |
| Android wrapper | Capacitor native project generated; production web assets synced |
| Android APK | Not produced: Gradle distribution download unreachable; SDK absent; installed Java 17 is not the configured Capacitor 8 toolchain |
| Browser/device visual QA | Not run; supported browser-control skill unavailable in this managed environment. DOM tests are not visual QA. |
| Live Firebase / cloud tests | Not run; no credentials/project supplied |
| Hibernation / restart fault tests | Not run against real Cloudflare; restoration source compiled only |
| AI benchmark | 400 seeded seat-alternating deals, advanced vs random: 260 wins (65%), mean 8.37 collected Sars. Does not establish expert/human strength. |

React, Phaser, Capacitor, Firebase, Vitest, Playwright, Vite, TypeScript and Wrangler installed from current stable npm tags. Exact resolved versions are captured in package-lock.json. The development environment used Node 24.19.0. No payment, billing initiation, ad unit or app-store action occurred.

Remaining release requirements are in README.md. The received master brief ended mid-sentence in its mandatory-QA section; omitted requirements could not be assessed.
