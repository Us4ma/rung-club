# Friends and team invitations

Implementation only. No tests, builds, CI runs, screenshots, or browser automation were executed for this change. Changes have not been pushed or deployed.

## Storage and transport

- `apps/server/migrations/0001_friends.sql` adds canonical friendship pairs and invitation records. The same idempotent schema is in `schema.sql`; the social service also initializes missing tables on first use. No new Durable Object binding is required.
- `GET /api/friends` provides the authenticated player's friends, pending requests and recent invitations. `POST /api/friends/action` handles social commands through the existing serialized Durable Object infrastructure. Identity comes from authentication, never a supplied sender ID.
- `POST /api/social-ticket` issues a single-use ticket for the existing WebSocket endpoint's social channel. Notifications invalidate the client snapshot. Polling and visibility refresh recover missed events.
- Presence uses the existing device lease and room membership. Moving between lobby and table does not create a separate presence identity. Existing session takeover closes the old device's social channel.

## Requests and invitations

- Accepted friendships are mutual. Pending requests expire after seven days; resending is limited to once per 24 hours and updates the existing pair. Reciprocal requests accept the pair. Decline, cancellation and removal are supported.
- Invitations require an accepted friendship and an available online recipient. Invitations expire after 45 seconds; outgoing invitations are limited and duplicate sends reuse the pending record.
- Inviting from the lobby prepares a held room. Acceptance seats the friend opposite the inviter, registers the team with the existing queue, waits for human opponents, then uses the existing bot fallback.
- Existing table invitations reserve only an empty or bot teammate seat. A started deal finishes and settles before admission. Accepted reservations have a five-minute admission timeout. Human seats and ongoing Sars are never replaced.
- Room admission records a persisted notification outbox, allowing account routing and social notifications to retry after transient database or network failure.
- A human teammate blocks same-table invitations. A new-match option is offered at a safe deal boundary. Private rooms retain their current start permissions and scoring exclusions.
- Social payloads contain public profile fields and presence, never hands or hidden gameplay state.

## Next task: manual verification

Check request acceptance/decline/resend, reconnect and device takeover, online/offline transitions, invitation acceptance/decline/expiry, opposite teammate seats, human matchmaking and bot fallback, queued admission after settlement, inviter departure, occupied teams, private host start, guest/account linking, and mobile portrait/landscape drawer layout. Confirm existing scoring, progression, and private-table exclusions remain unchanged.
