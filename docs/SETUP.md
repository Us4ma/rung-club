# Start playing

Run `npm ci` and `npm run dev`, then open the localhost URL printed by Vite. Practice works without cloud credentials. Use the served build for the current art library; generated standalone HTML is an experimental delivery path, not the validated current asset bundle.

## Develop / local four-player multiplayer

Requires free Node 24+ and npm. From the project directory:

```sh
npm ci
npm run server
```

In a second terminal:

```sh
npm run dev
```

Open the localhost URL printed by Vite. Use separate browser profiles or private contexts for different guests; tabs in the same profile share one account. Create a room, join its code from three other contexts, mark every human Ready, then host Start. Empty seats are clearly labelled bots in these casual matches. Rooms persist in `local-dev.sqlite`. Local identity is only a development simulation. Human turns receive automatic legal moves after 20 seconds. A temporary disconnect reserves the seat for 60 seconds; intentional departure or grace expiry replaces that seat with a labelled bot. Deals continue automatically after a short result beat; a departed player’s human teammate chooses Continue With Bot or Leave at the deal boundary. Initial comparison is not repeated between deals.

```sh
npm test
npm run test:e2e
npm run build
npx tsc -p tsconfig.worker.json --noEmit
npx wrangler deploy --dry-run
node scripts/benchmark.ts
node scripts/standalone.mjs
```

Playwright tests the HTTP/WebSocket server with four identity contexts and `npm run test:visual` exercises a real Chromium browser across desktop, portrait and landscape sizes. Vitest interaction tests use a DOM simulation. Native-device QA still needs a real Android device. See `docs/QA_CONTINUOUS_TABLE.md` for the actual results of this correction.

## Free cloud setup

Use Cloudflare Free and Firebase Spark only. Do not upgrade or enable billing. Firebase anonymous and Google authentication must be enabled in a user-owned project; no SMS/phone auth is used. Configure permitted Firebase domains. Create a free D1 database, replace only `database_id` in `wrangler.jsonc`, apply `apps/server/schema.sql`, set `FIREBASE_PROJECT_ID`, and set the trusted origin.

Client `.env.local` (public Firebase configuration, not admin secrets):

```text
VITE_FIREBASE_API_KEY=your_public_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
```

Build and use `wrangler dev` for cloud-shaped local testing. The repository is linked to Vercel and Cloudflare Git builds. The continuous-table release’s live anonymous authentication, full 13-Sar settlement and automatic successor deal were verified; see `docs/QA_CONTINUOUS_TABLE.md`. Other provider/device flows still need their own verification. Worker assets and API are designed for the same origin so HttpOnly session cookies work. `wrangler.jsonc` uses SQLite Durable Objects and hibernating WebSockets. State and receipts restore from storage. Bots use alarms rather than permanent intervals. An empty Firebase project ID fails closed for online accounts while practice works.

A Cloudflare `pages.dev` option serves `dist/` for **practice only**. Upload the static build through a free Pages project. Do not claim multiplayer works on that static deployment: it requires Worker routing on the same origin, or an explicitly implemented cross-origin auth transport. No paid domain is required.

Quick Play groups up to four accounts through a serialized queue; host still controls readiness/start. Casual bot-fill is explicit. Rooms are not ranked. Queues currently require the host to start after readiness; timed matchmaking/autostart is not implemented.

## Android

Native source is in `apps/android/native`. Capacitor 8 requires its supported Android Studio/SDK and JDK toolchain; use the current Capacitor environment setup documentation. After a web build:

```sh
npx cap sync android
npx cap open android
```

Build a debug APK in Android Studio, or use `./gradlew assembleDebug` from the native directory when SDK/JDK are configured. No Google Play account is needed for debug installation. This environment generated and synced the Android project, but **did not generate an APK**: Gradle distribution download failed, the Android SDK was absent and only Java 17 was available.

## Rebrand

Edit `packages/ui/config.ts`, Capacitor app name/ID, web title/manifest, and app icon. Firebase/Worker names can be changed independently. Account and ledger data are not named after a specific card game. `packages/core/registry.ts` defines the adapter contract; the current room implementation is still Rung-specific and must be generalized when implementing a second game family.

## Rung Club deployment configuration

The Firebase web app `rung-club` has been registered. Public web configuration is in `apps/web/deployment.ts`; it is used only on the production Cloudflare origin. Environment variables override it for other deployments. No Analytics SDK is initialized. Local development remains credential-free unless explicitly configured. `wrangler.jsonc` verifies tokens against project `rung-club`.

Online buttons on Vercel navigate to the Cloudflare lobby, preserving selected mode and a join code. Select the online action again there. Cloudflare serves assets, API and WebSocket on one origin; cloud guest identity and online progress belong to that origin. Practice progress is separate per browser origin. Update `ONLINE_ORIGIN` when changing the Worker address.

Enable Anonymous and Google providers in Firebase Authentication. Authorized domains include `rung-club.vercel.app` and `rung-club.sammyqamar.workers.dev`. The owner confirmed Google sign-in is working. Do not enable billing.

## Google sign-in and same-origin online tables
Firebase Console → Authentication → Settings → Authorized domains must contain `rung-club.vercel.app` and `rung-club.sammyqamar.workers.dev`. Both domains were added and verified on 2026-10-14. The owner later confirmed browser Google sign-in works. Never put administrative credentials in the web client. Native Google sign-in remains unavailable; Android can use guest or email.

Vercel proxies `/api/*` to the existing Worker. HTTP sessions stay first-party; WebSocket connections use a 30-second, single-use server-issued ticket, consumed atomically before validating room membership. Tickets must not be logged. Open Rung quick play is explicitly casual and filled with three labelled advanced AI players drawn from a 20-name roster. Private rooms retain human readiness and seat handling. Occasional AI departures occur only after settlement; a newly named AI player continues in the same seat, without altering points or dealing state.

Tutorial entry points are disabled with `TUTORIAL_AVAILABLE=false`; lesson code and stored completion data remain intact. Google display names and photos come from verified Firebase token claims and persist in reserved profile rows. The profile picker offers the Google photo first and lets players switch back after equipping a roster avatar. No database migration or paid service is needed.

Actual lightweight checks: production web build and Worker type check passed; the published Vercel lobby has no tutorial entry/skip/replay controls, and Open Rung connected on Vercel to a started casual room with named AI players (Hassan, Rahul and Aditya in the observed session). The owner confirmed Google sign-in works; profile photo selection is persisted through the authenticated server profile.
