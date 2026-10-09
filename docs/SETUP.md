# Start playing

Open `playable/Rung-Club.html` in a modern desktop browser. This file includes all code and art needed for practice. Choose Learn to Play or Skip Tutorial, then Practice. Open and Band modes are selectable in the lobby. No login, server or service payment is required. A phone's file-preview application may not execute HTML; use a browser or the served web build.

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

Open the localhost URL printed by Vite. Use separate browser profiles or private contexts for different guests; tabs in the same profile share one account. Create a room, join its code from three other contexts, mark every human Ready, then host Start. Empty seats are clearly labelled bots in these casual matches. Rooms persist in `local-dev.sqlite`. Local identity is only a development simulation. Human turns receive automatic legal moves after 45 seconds; a player is not converted into a bot. Rematch requires every human to vote.

```sh
npm test
npm run test:e2e
npm run build
npx tsc -p tsconfig.worker.json --noEmit
npx wrangler deploy --dry-run
node scripts/benchmark.ts
node scripts/standalone.mjs
```

Playwright currently tests the actual HTTP/WebSocket server with four identity contexts, not browser screenshots. Vitest interaction tests use a DOM simulation. Visual phone/desktop and native-device QA still require a real browser/device.

## Free cloud setup

Use Cloudflare Free and Firebase Spark only. Do not upgrade or enable billing. Firebase anonymous and Google authentication must be enabled in a user-owned project; no SMS/phone auth is used. Configure permitted Firebase domains. Create a free D1 database, replace only `database_id` in `wrangler.jsonc`, apply `apps/server/schema.sql`, set `FIREBASE_PROJECT_ID`, and set the trusted origin.

Client `.env.local` (public Firebase configuration, not admin secrets):

```text
VITE_FIREBASE_API_KEY=your_public_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
```

Build and use `wrangler dev` for cloud-shaped local testing. The repository is linked to Vercel and Cloudflare Git builds. Cloudflare reported a successful deployment; live authenticated gameplay still needs verification. Worker assets and API are designed for the same origin so HttpOnly session cookies work. `wrangler.jsonc` uses SQLite Durable Objects and hibernating WebSockets. State and receipts restore from storage. Bots use alarms rather than permanent intervals. An empty Firebase project ID fails closed for online accounts while practice works.

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

Enable Anonymous and Google providers in Firebase Authentication. For Google linking add `rung-club.sammyqamar.workers.dev` to Authentication → Settings → Authorized domains. Anonymous enablement was reported by the owner; Google/domain configuration and live login remain to be verified. Do not enable billing.
