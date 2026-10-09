# Rules decision register — double-sar-v1-provisional

This software implements the supplied brief. “Confirmed” below means specified by that brief, not independently agreed by all regional players. Regional adjudication is still required before competitive release.

| Topic | Status | Implemented policy |
|---|---|---|
| Teams / deck / deal | Confirmed | Four players, opposite partners, 52 distinct cards; anticlockwise 5–4–4; call after five; finish 13 Sars. |
| First collection | Provisional | Opening `5`: same individual wins Sars 4 and 5. No collection on 1–4. If missed, consecutive 5–6 can collect on 6. `Policy.opening` replaces the boundary. |
| Double collection | Confirmed | Individual streak, never team streak. All accumulated Sars collected. Reset streak to zero after collection. 12 may collect; 13 always clears remainder. |
| Superior trump | Provisional `opponent-only` | Follow led suit. If led suit is live trump, overtrump an opponent when possible. When void in a non-trump suit, cut an opponent if holding trump and overtrump if possible. If partner is currently winning, cutting/overtrumping is optional. `always` removes partner exemption. If no superior trump exists, any trump is allowed. |
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
