# Rules decision register — double-sar-v2-optional-trump

This software implements the supplied brief. “Confirmed” below means specified by that brief, not independently agreed by all regional players. Regional adjudication is still required before competitive release.

| Topic | Status | Implemented policy |
|---|---|---|
| Teams / deck / deal | Confirmed | Four players, opposite partners, 52 distinct cards; anticlockwise 5–4–4; call after five; finish 13 Sars. |
| First collection | Provisional | Opening `5`: same individual wins Sars 4 and 5. No collection on 1–4. If missed, consecutive 5–6 can collect on 6. `Policy.opening` replaces the boundary. |
| Double collection | Confirmed | Individual streak, never team streak. All accumulated Sars collected. Reset streak to zero after collection. 12 may collect; 13 always clears remainder. |
| Void-suit legality | Confirmed correction | Follow the original led suit if held. Otherwise any card is legal by default, even after a cut. Default `voidTrump: optional`, `superior: off`. See [Pagat play / Double Sir](https://www.pagat.com/whist/rang.html). |
| Superior trump | Optional regional preset | `opponent-only` or `always` restricts voluntary trumps to higher ones when available; non-trump discards remain legal. When trump is led, follow suit and selected superiority apply. Explicit `voidTrump: compulsory` retains the older compulsory-cut regional preset, never selected implicitly. Stored policies without `voidTrump` use optional cutting. |
| Bhaag | Provisional explicit intent | Senior can mark a non-Ace, non-trump lead as an escape attempt. Classification never changes legality or winner. Before Band reveal, Bhaag classification is disabled for everyone to avoid leaking the hidden suit. Other low-power thresholds are unresolved. |
| Ace-on-Ace | Provisional exact activation | Winner's physical winning card is Ace; that same Senior immediately leads another physical Ace next Sar. Effective rank becomes 2, original card stays Ace. A downgraded winning Ace can continue this chain. No penalty on non-leading Aces. |
| Effective ties | Provisional | Earlier played card wins equal eligible effective rank. Example: downgraded spade Ace led before spade 2 wins the tie. |
| Redeal | Confirmed + safety guard | Any complete hand with ≥7 chosen trumps invalidates whole deal, no scores. Indicator counts as caller-owned. Preserve room, seats and match ID; revision increases. After 64 rejected redeals, reject calling and require fresh match; never silently impose points. |
| Band indicator | Confirmed | Indicator removed from playable hand; only caller sees it; returns exactly once on reveal. Others see card count but neither suit nor indicator. |
| Band reveal | Provisional uniform eligibility | Only on current player's turn, after a lead, when their playable hand cannot follow suit. Caller has same right. Sealed indicator is unavailable until reveal, including when its suit would follow. |
| Reveal obligation | Provisional | Requester must play a live trump if holding one; applicable superior policy still applies. With no trump, any normally legal discard is allowed. |
| Mid-Sar status | Confirmed | Each played card records trump eligibility at play time. Reveal never retroactively makes earlier cards trump. An earlier card in the now-trump suit can still win by led-suit ranking. |
| Final Sar | Additional provisional default | At the boundary after Sar 12, auto-reveal and return any remaining sealed indicator so every player has one playable final card. This prevents a caller-leading deadlock. Final-Sar auto-reveal requires regional confirmation. |
| Kot / Goon Kot | Provisional named classification | All 13 collected by one team: Kot if calling side, Goon Kot otherwise. Ordinary deal winner has more collected Sars. No Single Sir scoring imported. |
| Courts / match points | Unresolved, not implemented | Consecutive-deal courts, scoring multipliers, regional dealer penalties and match-ending thresholds are excluded from the playable single-deal preset. |

Examples live in `tests/core.test.ts`. Legal cards, Sar outcome and Bhaag classification have separate functions. Policy changes belong in the core, not in UI code.

## First-time experience update — highest-rank-v1

- **Approved opening selection:** each new regular match/rematch resolves a public highest-rank draw before creating the full 52-card deal. Aces high; suits never break a tie. Only highest tied seats redraw. Exhausted comparison decks replenish. The draw pool is separate from the freshly shuffled deal deck.
- **Bounded rare fallback:** after 64 tied comparison rounds, shuffle the full comparison pool and draw distinct ranks for the remaining eligible seats. This guarantees a unique highest rank without suit priority or seat nomination. The result records `boundedFallback`. This safety interpretation is provisional and independently testable.
- **Caller/lead:** opening winner calls and leads the opening Sar. An invalid seven-trump redeal retains that caller and room; it does not run another selection ritual.
- **Subsequent deals:** the product currently hosts single-deal matches. A rematch is a new match and uses a fresh opening draw. Multi-deal courts and dealer rotation remain unresolved; no regional rotation was silently introduced.
- **Tutorial:** one conserved scripted deal uses the same `call`, `legal`, `play`, `reveal` and collection functions. Its caller is intentionally seat 0 for teaching. It stops after the legal fifth-Sar collection; it is not a ranked/online result and awards no XP.
- **Progression:** existing 100 XP per level is retained. Band Rung requires 400 server-ledger XP (Level 5) to create/queue/join a new online seat. Existing valid room members can reconnect. Local practice XP is explicitly device-only and cannot unlock online access. Optional Band reveal teaching remains available below Level 5.
- **Timeout:** 20 seconds by default, phase/turn keyed and persisted. Reveal does not buy a fresh turn. A timeout uses only the active player's redacted view and the ordinary command validator. A guaranteed legal card is the fallback. Bots act after 700 ms. Teaching sessions have no competitive deadline.
- **Completion rewards:** online rewards require at least eight distinct manually validated card plays and a live room connection at settlement. A complete score/history is still recorded for a timeout-driven deal, but unattended/abandoned seats receive zero XP/Tokens. This participation policy prevents starting rooms and leaving to farm progression; no penalties are added.
