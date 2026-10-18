# Invitation admission freeze correction

The first serialized table snapshot/alarm after a friend joined could deadlock. CardRoom held its Durable Object request lock while draining admission notifications. completeFriendAdmission then called social-status on the same room, waiting behind its own lock. Table requests timed out, and login session recovery also waited for that room. Proxy HTML error pages subsequently surfaced as JSON parse errors.

Correction:
- Pass authoritative membership directly from the room to the completion helper.
- Never call a room from admission completion; use only database operations and independent account-object compare-and-set routing.
- Persist the recipient's pre-admission room reference, preserving later room changes and supporting queued admissions from an old waiting room.
- Do not reconnect an inviter whose existing connection already matches the joined table.
- Show a reconnect message for non-JSON service responses and recover malformed socket messages through HTTP.
- Invitation response window reduced to 20 seconds; accepted mid-deal reservations still wait safely for a deal boundary.

The new regression reproduced the failure against the previous code using CardRoom.fetch/http-state, rather than directly invoking an unlocked method. It now passes for immediate and queued admissions. The focused run passed 51 checks, including room lifecycle, prior stale-routing protections, profile feedback, expiry and socket fallback. Frontend and Worker TypeScript checks also passed. No accounts, progression or gameplay rules are reset.
