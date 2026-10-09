# Free-plan controls

No upgrade, billing account, paid plugin or paid inference service is needed for local play.

Workers / D1 / SQLite Durable Objects and Firebase Spark have finite free quotas. Free plans stop being a viable public host if demand exceeds limits; do not assume unlimited service. Keep billing off and inspect Cloudflare's free dashboards before promoting a release. No background analytics or paid crash reporter is installed.

Room snapshots persist on accepted gameplay/control commands; bots wake through alarms. Hibernating sockets do not run idle animation ticks. Human timeout alarms are 45 seconds; inactive rooms expire after 24 hours. Local server caps stored rooms at 100. Production gateway limits each source IP to 120 API requests/minute; socket caps and payload limits apply separately. Rate-limit objects themselves consume storage operations. Initial quick-play queue supports casual rooms only; a dedicated capacity/quota admission controller is still needed before broad launch.

Economy, purchases and production ads are disabled by default. D1 result/reward writes occur on settlement with stable unique keys, not on animation frames. Client practice needs no database or network. Quota/external-auth errors cannot stop offline practice, but fine-grained room-side quota-exhaustion recovery and backoff still require implementation and fault testing.

Check current official free quotas before deployment rather than hardcoding old limits:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/durable-objects/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://firebase.google.com/pricing
