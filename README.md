# Rung Club

Android/browser card platform with a shared authoritative TypeScript rules engine, React table/menu UI, local programmed bots, and Cloudflare multiplayer source. Development uses free tools and services; no paid assets or required billing. This is not a production-complete implementation of every master-brief feature.

## Run and verify

```sh
npm ci
npm run dev                 # practice works without cloud credentials
npm run server              # separate terminal: development-only multiplayer
npm test
npm run test:e2e
npm run test:visual
npm run build
npm run typecheck:worker
npm run android:sync
```

Open the URL printed by Vite. Use separate browser profiles for local multiplayer identities. Native debug APK generation still needs the free Android SDK/JDK toolchain; asset sync is not an APK build.

## Continuous-table rules update

The default preset is `double-sar-v3-continuous`:

- Public highest-rank contest only for a table’s first deal; tied highest seats redraw. Then reshuffle the full 52 and deal 5+4+4. Subsequent caller/D rights come from the previous result.
- Follow the original suit. Open Rung cutting is optional by default; superior-trump and Band reveal obligations are separate named policies.
- First potential pile collection at Sar 5. Same individual must win consecutively and complete with an eligible non-Ace, non-Rung Senior lead. Qualification is automatic. Ace/Rung can win and maintain Senior without completing collection. Sar 13 always allocates the remaining pile.
- All 13 Sars settle: normal 7–12 win +0 points, calling-team all13 Kot +13, opposing-team all13 Goon Kot +26. Match points, Sars and deals won remain separate.
- Shared seat helpers keep D to the caller’s right for every result. After the result beat, the next deal starts automatically without resetting identities or table totals.
- Intentional exits replace the same seat with a labelled bot. The human partner chooses Continue With Bot/Leave after completion. Disconnects reserve the seat for 60 seconds. Interrupted/replacement-bot deals earn no Kot/Goon Kot points or completion rewards.
- Pile animations travel to the calling-team caller or opposing-team D representative. Card motion respects reduced-motion settings and never changes legality.

See [rules and remaining interpretations](docs/RULE_DECISIONS.md), [actual correction QA](docs/QA_CONTINUOUS_TABLE.md), [setup](docs/SETUP.md), [trust boundaries](docs/SECURITY.md), and [asset ownership](docs/ASSETS.md).

## Delivery / remaining work

The repository is public at `Us4ma/rung-club`; the Vercel frontend is `rung-club.vercel.app`. Cloudflare hosts online play at `rung-club.sammyqamar.workers.dev`. A frontend deployment does not itself update the Worker. The existing Cloudflare Git integration deployed this release; live QA verified `double-sar-v3-continuous`, a complete 13-Sar deal, Goon Kot +26, preserved points and automatic deal 2. The isolated anonymous QA identity was deleted afterward. The CLI is unauthenticated here, but Git deployment works; `wrangler login`/`wrangler deploy` remain optional manual alternatives.

Accounts, guest linking, Firebase verification, unique usernames, revocable sessions, profiles, D1 result/reward ledgers and hibernating room source remain implemented. This correction validates local, simulated Worker and a live anonymous-room path; it does not certify every Google/account-linking provider flow or native device. No ranked system, real ad provider, paid currency, full friends system, final audio or additional game runtime is introduced. Ads/economy remain disabled by default. Regional sealed-trump policies and match-ending thresholds remain documented decisions.

## Monorepo

- `apps/web`: responsive UI, PWA and lazy Phaser canvas
- `apps/android`: Capacitor wrapper
- `apps/server`: local authority, Worker/Durable Object, schemas and accounts
- `packages/core`: cards, rules, opening, seat rotation, round settlement, teaching fixtures
- `packages/protocol`: commands, persisted clocks, room lifecycle, progression/economy interfaces
- `packages/ai`: redacted-view programmed bots
- `packages/ui`: branding/audio/ad interfaces
- `tests`: core, security, accounts, UI, Worker, WebSocket and responsive validation
- `docs`: setup, rules, QA, ownership and limitations

MIT for original code; third-party libraries keep their own licenses. No app-store publication or Android APK is claimed.
