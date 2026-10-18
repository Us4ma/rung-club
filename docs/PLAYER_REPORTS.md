# Player reports and friend actions

Friends list options use a three-dot menu. Remove Friend requires explicit confirmation. Cancelling, dismissing or pressing Escape sends no removal command. Reporting is separate and never removes the friendship.

Reports are available from friend options and occupied table profiles, including persistent roster opponents. Authentication determines the reporter. The server checks table membership, the unchanged target occupying the selected seat, self-report prevention, and friendship for lobby reports.

Reasons: cheating, harassment, offensive profile, deliberate game disruption, other. Descriptions require 10–750 characters and at most 100 words. The server deduplicates submissions per reporter/target over 24 hours and limits each reporter to five daily submissions.

## Review reports

Open Cloudflare Dashboard → D1 → rung-club → Console. The private player_reports table is initialized on first valid submission; migration 0002_player_reports.sql also provisions it explicitly.

```sql
SELECT id, reporter, target, target_kind, target_name, reason, details,
       room, match_id, datetime(created/1000,'unixepoch') AS submitted_utc
FROM player_reports WHERE status='open' ORDER BY created DESC LIMIT 100;
```

Record review_notes and change status to reviewed, dismissed or action_taken using the table editor or an update scoped to the exact report ID. No public reviewer endpoint or in-game moderation dashboard is added. Reports do not automatically ban anyone or alter results.

Before workspace transport disconnected, 21 focused UI/server checks and frontend/Worker TypeScript checks passed. The implementation was recovered through GitHub for release.
