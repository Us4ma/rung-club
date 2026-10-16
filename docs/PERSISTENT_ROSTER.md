# Persistent roster and standings

Twenty stable `roster:*` identities use the existing avatar assets and normal table components. The Help & Matchmaking section and standings information disclose computer-controlled participants. Roster IDs never become authentication accounts or receive spendable currency.

Quick Play shares a mode-specific queue for up to 12 seconds. Four humans start immediately; otherwise missing seats receive roster opponents. Private rooms retain host-controlled starts. The Band Rung lobby remains coming soon, as before; its server rules and roster exhibitions are supported and tested.

Each completed deal is settled by the authoritative engine. Human settlement uses the existing results and XP ledger. Roster results use an additive `roster_results` table, created idempotently on first use and also declared in schema.sql. The primary key `(match_id, roster_id)` prevents replay grants. The participating roster IDs are captured at deal start, so a replacement cannot inherit credit for a departed human's partial deal. Full public card history is stored for auditing; profiles show up to 30 recent result summaries.

Lifetime records begin with this release; historical roster totals are not invented or backfilled. Rankings use total completed deal wins, then collected Sars; profiles without a completed game remain unranked. The leaderboard does not imply a human population or live online count. The top 100 combined entries are shown, without exposing human account IDs.

Daily at 06:00 UTC, the internal scheduler starts one Open and one Band exhibition using rotating groups of four roster identities. They run turn by turn through Durable Object alarms, legal seat views, and the same authoritative engine. Only games completing all 13 Sars count; rooms closed before completion do not. No exhibition endpoint is exposed through the public Worker API. Cron retries reuse the same day/mode room, preventing duplicate exhibitions.

Strategies vary across balanced, conservative, attacking and partnership styles, with intermediate and advanced skill levels. Decision inputs contain only the seat's own hand and public plays. There are no scripted outcomes, hidden-hand inspection or rank-based forced wins.
