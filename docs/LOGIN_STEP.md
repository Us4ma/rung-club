# Step 1 — account entry

The login screen is now the first screen. Successful guest/email/social entry leads to the lobby. Existing Firebase identities restore after the SDK finishes reading persistence. Local guest entry uses sessionStorage only as a navigation preference, never as server authentication. Sign-out clears that preference and the Firebase identity. Local practice statistics remain device-local.

## Visual direction

Original CSS felt weave, thin brass borders, restrained typography, and a code-drawn monogram replace the generated room background on entry and lobby. The approved female dealer is retained. No extra generated graphics or dependencies were added. The existing table graphics are outside this step's redesign.

## Firebase console setup (free Spark)

Authentication → Sign-in method:
- Anonymous: enable for secure cloud guest entry.
- Email/Password: enable the password option. Signup sends a verification email; reset uses Firebase email templates.
- Google: enable and choose the project support email.
- Facebook: requires a Meta developer app, its App ID and secret entered into Firebase (never the client), and the Firebase OAuth redirect URI registered with Meta. Eligibility/review is external; do not claim it is enabled from source code alone.

Authentication → Settings → Authorized domains:
- rung-club.vercel.app
- rung-club.sammyqamar.workers.dev
- localhost only for intentional local cloud testing.

The Firebase project configuration now applies on production Vercel and Cloudflare builds. Development does not use live credentials by default; supply VITE_FIREBASE_* to intentionally test cloud authentication. No paid provider added.

## Account behavior

Email signup or social entry links an existing anonymous Firebase UID. Credential conflicts stop without replacing the guest or silently merging progress. Existing email sign-in is an explicit switch to that email account. Passwords go only to Firebase, never to storage or the Rung backend. Cloudflare continues verifying ID tokens when creating authoritative server sessions. Guest fallback after a cloud failure is explicitly labelled local practice. Guest progress is not guaranteed after reinstall.

Vercel and Cloudflare are separate origins with separate Firebase persistence. Online room navigation still goes to Cloudflare; a player may need to sign in there as well. No tokens are placed in URLs. Live backend reachability and provider setup are not verified by these local tests.

Capacitor: guest and password flows use the SDK. Social popup sign-in is blocked with a clear message in native WebView until a proper native OAuth flow is implemented. Native sign-in/device testing and an APK are not claimed.

## Checks

44 unit/UI/auth tests, 9 Chromium browser tests (including four entry layouts and original table flows), TypeScript/Vite build, Worker typecheck and Capacitor asset sync. Provider SDK behavior is mocked in unit tests; no live social account has been authenticated. Rung rules, AI, protocol and server sources unchanged.

References:
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/web/facebook-login
- https://firebase.google.com/docs/auth/web/account-linking
- https://m3.material.io/foundations/layout/canonical-examples/overview
