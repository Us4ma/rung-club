# Weekly leagues implementation

Implemented without local tests, builds, browser automation or screenshots. Publishing was subsequently authorized; deployment builds run through the existing Git integrations.

- Five tiers, Monday 00:00 UTC rollover, stable 40-player groups, proportional 25% zones. Eight members and eight active participants are required; provisional groups have no tier changes or prizes.
- Signed settlement profit drives weekly scores. Existing lifetime records, wallet amounts and gameplay rules remain intact. No estimated historical weekly earnings.
- Current configuration includes the existing persistent roster, with actual public-table results only. No invented authenticated accounts or outcomes. `LEAGUE_RULES.includeRoster` controls future participation.
- Private, practice, tutorial, exhibitions and invited tables do not score. Human participants must remain connected through a completed uninterrupted deal. Limit three qualifying results per human-involved pair per UTC day and 20 per human daily. Reaching a cap excludes the entire result symmetrically; wallet settlement still occurs.
- Ties use wins, fewer matches and the first persisted attainment of the tied net score.
- Existing `__coins` coordinator serializes assignment, scoring and rollover. Scores join the wallet settlement's atomic D1 batch. Group awards, frozen results, tier updates and cosmetics settle atomically with deterministic reward IDs. Roster rewards use separate storage.
- New schema is additive and initializes on use. Weekly cron and lazy catch-up handle rollover. Historical results, highest tiers and acknowledged notices persist.
- Responsive UI follows the approved design: badges/tabs, podium, positions 4 onward, zone indicators, pinned own position, rewards, season-end notice and profile honors.

Rewards and league rules are configurable in `packages/protocol/leagues.ts`. Testing and deployment are intentionally deferred.
