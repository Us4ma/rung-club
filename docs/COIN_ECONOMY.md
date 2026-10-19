# Coin economy — initial testing release

Public rooms created after this release use a 2,500 default/minimum initial buy-in, 10,000 maximum top-up target and a fixed 200 coin stake per player per deal. Existing rooms finish under their original rules. Private rooms and practice have no coin stakes or ranked progression.

Each account can explicitly claim 10,000 welcome coins once, including existing accounts during this rollout. Linking a guest preserves that identity and grant. The server ledger is authoritative. The wallet excludes coins held at a table; unused table coins return on leaving/disconnection/room expiry.

A winner receives their 200 stake plus 100 ordinary-win profit (provisional), 150 Kot profit or 180 Goon Kot profit. These amounts correspond to 50%, 75%, 90% of one losing contribution. Rake across a complete four-player deal is respectively 200, 100, 40. Rake is not a percentage of the entire pot. Only the 200 stake is at risk; a Kot never increases the loser's debit. Displayed standings keep the current ordering. `coin_results` records stake, payout and net change independently of grants and wallet transfers for future winnings rankings.

The dedicated `__coins` Durable Object serializes money mutations without callbacks into room objects. D1 batches atomically transfer buy-ins and cashouts, reserve stakes and settle results. Stable welcome IDs, top-up request IDs and deal IDs make retries idempotent. Automatic top-up is opt-in, applies at deal boundaries and tops up to 2,500 only if the wallet can cover the full difference.

An underfunded seat pauses between deals for up to 20 seconds. Its owner sees a refill selector or the coin shop if unable to fund the seat; other players see a short waiting notice. The seat becomes an automated replacement after expiry; the table continues. HTTP fallback and WebSockets both receive a funds-required event. No human is replaced in an active Sar. Leaving during a deal returns the unused stack but does not refund the committed stake. If everyone leaves before completion, committed entries are forfeited. Financial settlement is separate from XP/stat eligibility.

Automated seats act as a house counterparty; their contributions and payouts are explicitly recorded in `coin_events`. This does not represent human purchases or ad revenue. No outcomes or cards are altered for the economy.

The themed shop is a UI shell. Coin packages and the planned 2,500-coin rewarded ad are unavailable until real providers are integrated. No payment collection, fake ad, free ad-grant endpoint or purchase fulfillment is enabled. Private/practice access remains free. Ads must later use verified server callbacks, idempotent transaction IDs and a configurable daily cap. Price/package amounts are placeholders, not purchasable offers.

Schema creation is additive and lazy; no existing accounts, ledgers, friendships, rankings or game rules are reset. Tests cover duplicate grants and top-ups, payout conservation, negative/over-limit requests, wallet/table isolation, cashout, opt-in refill, actual public/private rooms, boundary release and HTTP fallback. No full local build or automated browser/screenshot run was performed.

## Coin presentation

Welcome grants animate into the visible wallet only after the server confirms the idempotent grant. The table overlay renders chip banks inside the felt, a dealer tray with the four-player pot, and settlement fields supplied by the server (winner team, per-winner return and rake). Presentation never changes a balance. Hydration/reconnects suppress historical payouts; hidden tabs cancel pending flights. Reduced motion uses a brief static result. Recorded chip sounds share the existing single Web Audio queue with card sounds and honor the sound setting.

The versioned table-v3 audio sprite contains the original table-v2 material followed by four excerpts from Kenney Casino Audio: chips-handle-3, chips-stack-3, chips-collide-3 and chips-handle-6, licensed CC0. Original license is in docs/third-party/kenney-casino-audio-LICENSE.txt; source metadata is next to each sprite.

Wallet/bank labels abbreviate K/M/B/T amounts while retaining integer coin balances and exact accessible wallet labels. Opening draw positions are measured from the felt rather than portrait/trick positions. Chip overlays capture no input and occupy no grid space. Focused coin, sound-queue and geometry checks pass. An existing gameplay-presentation suite has four unrelated callout-text/announcement expectation failures; those announcements were not modified by this change. No automated browser or screenshot run was performed.
