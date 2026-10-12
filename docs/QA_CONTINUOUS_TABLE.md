# Continuous-table correction QA — October 12, 2026

## Actual results

| Check | Result |
|---|---|
| `npm test` | 229 tests passed, 19 files |
| `npm run test:e2e` | 5 real HTTP/WebSocket tests passed; four identities, validation, reconnect, timeout, consecutive deals, deliberate exit, bot completion and partner decision |
| Gameplay browser suite | 13 checks passed across 1920×1080, 1366×768, 390×844, 360×800, 844×390 and 932×430 |
| `npm run build` | TypeScript and production Vite build passed |
| `npm run typecheck:worker` | Passed |
| `npm run android:sync` | Passed; no APK generated or native-device run claimed |
| Cloudflare CLI | `wrangler whoami`: unauthenticated; live Worker rollout is not certified by these local checks |

The Vite build retains the existing lazy Phaser chunk-size warning. No new packages, paid services, paid artwork, currencies or advertising providers were added.

## Important regression evidence

- Existing full-deal bot/core tests retain card and Sar conservation checks; three additional genuine consecutive deals verify fresh decks, monotonic revisions and persistent table totals.
- Every caller seat is tested against normal calling win, normal opposing win, Kot and Goon Kot. D/right convention and winning-team caller parity remain consistent.
- Ace/Rung completing leads keep Sars unclaimed; later eligible same-player wins collect the full pile. Teammate streaks never combine, successful collection resets streak, Sar 12 can collect, Sar 13 always clears the remainder.
- Old explicit-intent assertions were replaced only where the owner changed the rule. Eligible fixtures use a non-Ace lead; negative Ace/Rung cases keep strong score/pile assertions.
- Shared legality remains the source for humans, UI, bots and timeouts. Optional cuts remain available after earlier trumps; original suit following and scoped superiority/reveal policies remain tested.
- Worker handlers persist identities, positions, clocks and table summaries. Deliberate exit changes only the departed seat; disconnects reserve identity through grace. Both human teammates departing or no humans remaining closes the room without incomplete settlement.
- Duplicate scoring, stale commands and repeated alarms cannot create two next deals. Older receipt keys migrate without losing idempotence.
- A simulated D1 failure confirms that the completed authoritative state is durable before settlement retries; core credit and ledger keys remain idempotent.
- UI tests confirm automatic next deal, retained match totals, one D tag, removal of manual Bhaag intent and removal of Play Again confirmation. Collection presentation uses its designated caller/D recipient and clears on the next deal.
- Actual browser screenshots were inspected at portrait and desktop sizes; gameplay controls remain usable and viewport checks report no horizontal overflow.

## Remaining interpretations / deployment limits

See `RULE_DECISIONS.md`: unrevealed Band collection qualification is conservatively disabled to avoid hidden-suit leakage; final-Sar auto-reveal and the extreme repeated-tie safety fallback still need regional confirmation. No match-point ending threshold or courts policy was specified.

Live Firebase/Cloudflare multiplayer, account-provider linking and physical Android behavior are not newly certified by this correction. The new Worker must be deployed to the existing owner-controlled free project and its live rollout verified. Vercel frontend deployment alone updates practice presentation/logic, not the Cloudflare room authority.
