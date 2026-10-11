# Account lifecycle fixes — 11 October 2026

## Guest return on this device
Guest Sign out is a club exit: close the room, clear tutorial overlays, and persist `rung:signed-out=1`. Firebase's device-persisted anonymous identity remains in SDK storage. Restoration and all client token helpers respect that flag. Play as Guest explicitly clears it and reuses the same Firebase UID. No credential is copied into an application-created password/token store.

Member sign-out still calls Firebase signOut. Signing into a different existing account replaces the SDK identity; this implementation does not maintain multiple saved accounts. Clearing browser/app storage or uninstalling can lose an unlinked guest. Secure a guest using Google/email to retain access elsewhere. Browser-local practice retains its saved profile across sign-out too.

## Signup name
Signup retains the username field. After successful creation/linking, the client PATCHes `/api/identity` with that name before opening the lobby. The existing unique database constraint reserves it. A name conflict opens only the naming recovery screen, with the attempted name retained; it does not recreate the Firebase account. Returning profiles remain behind the branded loader until fetched. Stale restoration/profile responses cannot reopen the lobby after exit.

## Account deletion
Settings and Profile navigate to a separate confirmation page. Opening it makes no deletion request. The player must type `DELETE`; password accounts additionally confirm the password, and Google accounts reauthenticate through Google. Cancel keeps the account. Controls are disabled during processing.

The browser sends a verified bearer token to Cloudflare `DELETE /api/identity`. The server derives the UID from token verification, accepts no client authority over the UID, validates confirmation, requires a recent member sign-in, and atomically removes sessions, personal results, ledger and cosmetics through D1.batch. A minimal deleted-UID tombstone rejects old credentials and releases the username. Match settlement checks the tombstone so an in-flight game cannot recreate personal results or rewards.

After backend success, the client removes the Firebase identity. These two providers cannot share a transaction: if Firebase removal fails, the screen accurately reports partial deletion and supports idempotent retry. Google-linked deletion on native Android currently directs the user to the browser, matching the existing native Google integration limitation. Local practice deletion clears only device practice data.

## Tutorial exit
Sign-out clears intro, unlock, basic and advanced tutorial state. Skip Tutorial renders only in an eligible lobby/table context; its handler also refuses other screens. Authentication, registration and deletion screens cannot enter a lobby through this shortcut.

## Validation
- 149 unit/regression/security tests, including same-UID guest re-entry, locked session access, signup reservation/conflict, deletion cancellation/network failure/retry/atomic rollback/forged UID, and deleted-account match settlement.
- 60 browser tests, including desktop/phone account lifecycle, entrance at six viewport sizes, tutorial and gameplay regressions.
- 4 local authoritative multiplayer integration tests.
- Production build, separate Cloudflare worker typecheck, Wrangler deployment dry-run and Capacitor Android asset sync.
- Confirmation screenshots: `art/qa-accounts/1366x768-confirmation.webp` and `art/qa-accounts/390x844-confirmation.webp`.

Provider tests use controlled Firebase SDK mocks; browser tests use credential-free local practice. No real account was deleted during QA. No Android APK/device run is claimed. Public Cloudflare deployment and real Google/password deletion must be verified with the owner's configured cloud environment; this workspace's Worker requests are blocked by Cloudflare edge protection. A successful local dry-run is not a production rollout.
