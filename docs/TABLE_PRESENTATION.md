# Gameplay table presentation — October 12, 2026

## Scope and composition

The approved `Luxurious Rung Club Game Table(1).png` was inspected as the composition reference. The implementation uses independent responsive elements: existing room, existing female host, original woven SVG felt, CSS walnut/gold rail, four player identities, card-face SVGs, selectable hand, live HUD and physical card-back pile. The reference is not shipped as a flattened interface. No gameplay, scoring, account, matchmaking or server rules were changed.

Local player is bottom; partner is centered at top; opposing players occupy the sides. The host occupies a separate right-side area with no playable seat or turn. D and R continue to derive from authoritative dealer/caller fields. Profile and table settings controls are at upper right. Profile opens a compact identity panel without leaving the active table. Communication remains preset reactions only.

Desktop uses an overlapping horizontal hand with large rank/suit indexes; portrait uses seven cards per row and up to two rows, with tap targets at least 44px wide at the tested sizes. Landscape reserves a right control column and positions its hand below the local seat. Timers, legal state, selected lift, reveal, drag/drop and double tap preserve the shared validator and existing command path.

## Motion storyboard

| Transition | Visual behavior | Timing |
|---|---|---|
| Deal | Existing opening comparison, concise shuffle, then card backs distributed to all four seat anchors; 5 and 4+4 stages reuse existing state | Flight 780ms with stagger; last flight retires within 2.05s |
| Play | Authoritative hand removes the card; new card flies from remembered local card origin or remote seat into its fixed relative trick slot | 220ms |
| Fourth card | Exactly one winner receives a restrained highlight; four visible cards gather into the dedicated central stack | Gather starts 320ms after completion, lasts 250ms; completion layer retires at 650ms |
| Pile accumulation | Existing central stack remains at its previous size until gathered cards arrive, then shows the authoritative unclaimed Sar total | 620ms |
| Valid collection | Gather finishes first; a single full stack moves from the central pile anchor to the recorded caller/D recipient; central stack clears | Central clear 580ms; stack flight starts 580ms and lasts 550ms |
| Hand changes | Remaining keyed cards use measured previous/current positions to slide into place after removal or sort | 180ms |

HUD scores immediately reflect the authoritative state; visual pile timing is presentation only. Animations never submit moves, delay the server or decide qualification. A faster subsequent legal play may shorten a completed trick visual rather than block input. Reduced motion retains static card/state updates without flights. No additional dependencies or runtime raster assets were added; the original felt SVG is under 1KB.

## Replay and reconnect safety

Each newly connected socket's first snapshot changes only a presentation epoch. Motion components remount with that snapshot as their baseline. Visible hydrated live cards are not treated as newly played cards; historical collections and complete tricks do not replay. Duplicate revisions do not create additional flights. Catch-up snapshots spanning multiple Sars update directly. New deals reset the card-event keys. Web Animations and timers are canceled during cleanup; decorative layers never capture input.

## Validation evidence

- 13 existing gameplay browser scenarios: 12 passed in the combined run; the failed 390×844 tutorial collection scenario passed on a focused rerun with unchanged assertions. The earlier development run was affected by live source edits; the later capture run used stable source.
- Six dedicated layout scenarios passed in their final run: 1920×1080, 1366×768, 412×924, 390×844, 360×800 and 844×390. Assertions cover four seats, one D marker, four fixed trick slots, host/seat clearance, trick-slot/seat clearance, 44px hand targets, horizontal overflow, functional profile/settings and no browser errors.
- Five local multiplayer integration tests passed, including reconnect, command validation, continuous deals and departed-seat bot replacement.
- Production web build and Worker type check passed. Existing lazy Phaser chunk warning remains.
- All 236 unit tests across 20 files passed. New unit regressions cover hydrated live cards, one-time completed-trick gathering, old collection suppression, hand removal, delayed stack updates, reduced motion and authoritative Bhaag announcements.
- Screenshots from the actual running practice table are in `docs/art/qa-table-overhaul/`. They may contain different legal hands because shuffling remains random. Capture waits for the dealing state to return to waiting.

React review: stable card IDs; unique component/epoch keys; motion cleanup; semantic buttons and dialogs; local component state for table tools; reduced-motion guards; no added heavyweight assets; no client rule adjudication. Main lobby and authentication were not restyled.

## Remaining polish

The existing dealer is a static illustration with restrained idle motion. It is not a skeletal or lip-synced character. Sound remains the existing placeholder system. Physical Android/device GPU performance has not been newly measured; portrait/landscape evidence is browser viewport testing. Broader regional rule decisions remain in the existing rules register and are outside this presentation update.
