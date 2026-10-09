# Security and privacy boundaries

Local Node server is **development only**, loopback-bound, cookie identity simulated. Its identities are not Firebase identities. Do not expose it to the internet.

Cloud Worker verifies Firebase RS256 signature via Google's cached JWKS, audience, issuer, expiration, subject and authentication time. Exchanges for an opaque HttpOnly / Secure / SameSite=Strict cookie, with only its SHA-256 hash stored in D1. No Firebase admin key is included. Deleting or logging out revokes app sessions; deletion tombstones the UID and erases app results/ledger/cosmetics. Firebase client identity deletion can require recent reauthentication and is distinct from app-data deletion.

Mutation and socket origins are restricted. Gateway has per-IP 120 requests/minute Durable Object limit, rooms limit connections per user, socket messages 12/s and 4 KB. Rate-limit DOs add storage operations: measure quota use before public launch. No production provider has been runtime-tested with credentials in this environment.

Authoritative room checks owned cards, turn, matching match ID, exact command sequence and revision. Duplicates return existing receipt. Session ownership is established by gateway identity; it overwrites user headers before room routing. Hands and indicators are stripped per viewer. Mid-Sar trump status is recorded per play. No free-text chat, admin client credentials or rewarded-ad reward endpoint exists.

D1 batch operations settle match result and rewards atomically. Unique result and ledger keys prevent repeat grants. Wallets derive from the transaction ledger. Cosmetic debits have sufficient-balance guards; duplicate purchase callbacks cannot charge twice. Economy defaults off. There are no stakes, cash-outs or competitive purchases.

Firebase linking preserves existing UID; conflicting existing credentials cancel linking rather than merge or overwrite progress. Web popup linking is implemented; native Google linking inside Android WebView is **not device-verified** and may require a free native provider integration. A deleted unlinked guest cannot be recovered.

Before a public release: exercise real Firebase revocation/deletion/link conflict flows, restart/hibernate room tests, native account linking, storage exhaustion recovery, browser/device QA, connection load, provider consent and security review. Do not enable ads merely by changing a flag: only simulated provider interfaces exist, no eligible production ad SDK is integrated.
