# Profile, avatar and username correction

Avatar choices use neutral emerald tiles with gold selection outlines. A CSS oval mask hides the accidental second-frame fragments at the bottom of the supplied raster files. Portraits remain independent of game controls. Tiles size to their contents rather than forcing square buttons; account controls have separate margins and mobile stacking.

Email registration asks for a username, then registered players without a reserved name complete a username step before entering the lobby. Google sign-in uses the same setup step. Existing registered accounts restore their server name rather than inheriting Guest or another device profile. Guest linking preserves the UID and prompts for a name when needed. Profile usernames can be changed with the same server validation.

The Worker exposes /api/identity GET/PATCH with verified Firebase bearer tokens. It accepts only the production browser origin, Worker origin, configured allowed origin and Android's https://localhost origin. No cross-origin cookies are enabled. Existing account revocation/deletion checks apply. D1's unique NOCASE name constraint resolves simultaneous claims atomically. Names use 3–20 ASCII letters, digits and underscores; system names are reserved. Duplicate names return 409. No schema migration is required. No password or admin credential is stored in the client.

A local practice name is explicitly separate from a reserved online username. Production username storage requires this commit's Cloudflare Worker deployment. Firebase provider/domain configuration remains separate from profile storage.

Validation: 65 Vitest tests, 22 Chromium presentation tests, production build, Worker type check and Worker dry-run bundle passed. Capacitor Android asset sync passed; this is not an APK build. Screenshots in qa-profile show desktop profile, phone profile and phone registration, taken from the running local client. The username tests cover registered-account restoration, duplicate/retry flows, simultaneous claims, forged UID input, invalid tokens, revocation, deletion and trusted CORS.

Gameplay rules and match resolution are unchanged.
