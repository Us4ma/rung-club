# First-time experience and room timing

This update extends the existing Rung Club codebase. No paid dependencies, new services, database tables or destructive account migrations are required.

## Implemented behavior

New online account inserts set `accounts.tutorial=4`. Codes are 4 not-started, 2 in-progress, 1 completed, 3 skipped. Existing legacy 0 rows are considered completed so this rollout does not restart established players. Status updates use a SQL terminal-state guard, are scoped to the verified Firebase UID, and never grant XP. The same UID survives guest linking. Local fallback keys include that UID; offline practice uses `onboarding:local`. Profile restoration finishes before onboarding/username UI is selected. If a request fails, the account-loading retry screen remains available.

The introduction is inside the real lobby. Its pointer is attached to the Open Rung button, not a viewport coordinate. Skip has a reserved safe-area row. Replay is in Settings and Rules. A guided match deals five cards, calls hearts, completes 13 cards, then plays five conserved Sars using scripted legal bots. Player wins the first Sar, yields the second, legally cuts spades on the third, and wins Sars four and five to collect the opening pile. Each action uses the regular validator. No timer, match settlement or XP award runs in teaching mode. Optional interactive Ace-on-Ace, Bhaag and Band reveal examples plus a legally simulated all-13 Kot/Goon Kot example are available from Rules.

## Dealer assets and animation

The approved `dealer-female.webp` and `dealer-seated.webp` are static transparent poses, not a skeletal rig. CSS transform animation provides greeting, subtle idle motion, shuffle/deal, calling/waiting, reveal, collection and result reactions. Procedural card backs fly toward DOM-measured seat centers. Opponent cards never receive face data. Public opening draw cards animate separately; long pathological redraw sequences shorten their visual presentation. Animation is decorative and never disables an available legal input. Reduced motion removes flights and shortens draw presentation; the Animations setting does the same. Reconnection does not change authoritative hands or deadlines.

The server phase becomes active immediately after readiness/each validated command. Short decorative deal/draw effects can overlap that active phase; they never introduce an additional waiting phase or consume a hidden pre-turn timer. Selection buttons remain available throughout. A future synchronized preparation phase could defer deadlines until all clients finish visual dealing, but is not required for state correctness and is not claimed here.

## Server clocks and progression

`packages/protocol/timing.ts` owns clock keys, 20s defaults, legal automatic commands and expiry checks. Worker `CALLING_MS` and `TURN_MS` optionally override human times (bounded 5–120s); bot time is 700ms. Room messages include deadline, duration and server time. Clients show the countdown at the active seat using server offset. Room state and clock persist together; alarms target the existing deadline, not reconnect time. Worker handlers serialize mutations with Durable Object concurrency gates. Duplicate commands retain receipts; stale timeout clocks cannot advance a later turn. Legacy persisted room clocks migrate on restoration without rerolling hands.

Band Rung starts at Level 5, unchanged 100 XP/level. The Worker reads the D1 XP ledger at queue/create/init/private join. Existing room members can reconnect without eligibility corrupting the match. Offline practice uses local XP and labels it as such; development HTTP sessions deliberately have no trusted cloud XP and cannot create Band rooms. Unlock acknowledgment uses the existing cosmetics table with the internal marker `event:band-unlock-seen`, requires Level 5, and is inserted idempotently. It is not a purchasable item.

## Verification and limitations

See the release QA report for executed counts and screenshots. Browser and Capacitor synchronization are verified separately from APK generation. No Android APK or live Cloudflare room verification is implied by a successful local build. The existing configured Firebase/Cloudflare deployment is still required for secure online identities and persistent online XP; local practice and teaching require no credentials.
