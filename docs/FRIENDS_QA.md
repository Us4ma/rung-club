# Friends and invitations QA — 18 October 2026

Production source under test: `ca6a176bb4a17de4c4845f18fac49c692be7a342`.

## Focused local checks

43 distinct checks passed in the final combined run across the friends server flow, friend profile controls, existing room lifecycle, and device-session routing.

The social server harness executes the actual CardRoom and social service with SQLite-backed storage and isolated Durable Object instances. It uses four controlled player identities and the existing rule engine/bot roster. The UI checks render FriendControl in jsdom; they are not a visual browser or physical-phone test.

Coverage:
- Simultaneous Add Friend taps, one persistent pending pair, reciprocal requests, self-request rejection, forged sender fields, mutual acceptance.
- Immediate green-check feedback, server-confirmed pending state despite stale list snapshots, failed-request feedback, accepted state, no Resend action, no self control.
- Real-time social invalidation and no duplicate notification for repeated pending requests.
- Lobby partner formation, opposite seats, remaining human matchmaking slots, bot fallback, private host-controlled start.
- Active Sar remains unchanged; accepted friend waits for completed-deal settlement before replacing a bot.
- Reserved seat exclusion, occupied human partner protection, inviter departure, declined/cancelled/expired invite rejection and unauthorized acceptance.
- Admission outbox retries after a transient storage-completion error without duplicating a player seat.
- Server-derived online/offline presence, device takeover and persistent friendships.
- Existing room lifecycle, settlement, disconnect replacement, private XP exclusions and session-route checks.

## Live checks

`scripts/live-friends-smoke.mjs` creates three fresh in-memory Firebase anonymous identities, gives them clearly marked QA names, and exercises the deployed authenticated endpoints. It never reads browser accounts or changes existing roster identities. The final live result list and cleanup outcome are recorded separately in `FRIENDS_LIVE_RESULTS.json`.

Live invitations are observed through the authenticated API snapshots. WebSocket invalidation and profile-icon feedback are covered locally, not by a live browser automation claim. Physical mobile appearance and real-world network switching remain separate manual checks.

## Edge-case correction

A new regression reproduced delayed admission completion overwriting the inviter’s newer room reference. The fix no longer rewrites the inviter routing during retries, verifies recipient membership before updating routing, and uses a compare-and-set guard against intervening room moves. Regression checks cover both inviter and recipient departure and stale lease writes. The final combined run passed 43/43 after this correction.

Live result: 20/20 functional checks passed on production. Two of the three temporary accounts were deleted. One account cleanup was blocked by the table already closing (410); its in-memory credentials were discarded when the process exited. It remains an unused QA guest with no awarded results/XP. The harness now handles table leave and account deletion separately so closed rooms cannot skip deletion on subsequent runs. Full live browser/WebSocket delivery was not newly exercised.
