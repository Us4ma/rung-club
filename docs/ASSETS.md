# Asset and audio manifest

All visual assets are original code-authored assets; no commercial artwork was downloaded.

| Asset | Source / ownership | Use | Format | Approximate size |
|---|---|---|---|---|
| Card faces, backs, wood rim, felt | Original project code, MIT | Table / lobby | CSS / canvas | CSS 14 KB before gzip |
| Native default icon/splash | Capacitor-generated placeholders, MIT; replace before release | Android boot / launcher | PNG | Included in native source |
| App icon | Original project code, MIT | PWA | SVG | <1 KB |
| Seat avatars | Original initial-letter portraits, MIT | Identity | DOM / CSS | Included above |
| Typography | Browser system fonts / Georgia fallback | Interface | Installed device fonts | No download |
| Interface tone | Optional Web Audio sine, original placeholder | Selection feedback | Synthesized | No download |
| Final music and effects | Not supplied | Menu / gameplay / victories | OGG preferred, MP3 fallback possible | Target music ≤1 MB each; effects ≤40 KB each |

`packages/ui/audio.ts` lists replaceable file names under `apps/web/public/audio/`. Put licensed files there, build and sync Android. Audio loading/playback failure never blocks play. Music pauses on hidden tabs. Music, interface tones and haptics have separate controls. The selection tone is a placeholder, not premium final sound design.

Required final audio: menu loop (45–90 seconds), calm gameplay loop (60–120 seconds), optional competitive loop, victory and defeat stingers (2–5 seconds), card select, movement/place, shuffle/deal, Senior change, reveal, collection, Kot, button, reward and transitions. Avoid speech and distracting bass. Provide license/ownership confirmation before inclusion.

Phaser is lazy-loaded only on table entry (approximately 357 KB gzip). The standard web build uses a split initial download. The convenience standalone HTML embeds the entire client and is larger; no external scripts or assets are fetched for practice.

## Dealer and first-time experience overlays

The dealer uses the existing owner-supplied transparent female lobby and seated table poses. No new raster art or licensed animation rig was introduced. Tutorial hand pointer, timer ring, deck sprite and card-flight overlays are original SVG/CSS/TypeScript components (`apps/web/experience.tsx`, `experience.css`), covered by this repository's MIT license. Flights reuse the existing card-back SVG and contain no opponent card faces. QA screenshots are captured from the running application, not generated concept art.

## Premium authentication entrance

The account entrance reuses the existing female dealer and warm lounge WebP files as independent layers. Felt table, walnut rim, brass panel/frame, crest, buttons and decorative rules are scalable CSS/HTML. Reference screenshots are visual targets only and are not shipped as flattened UI. See [entrance QA](art/ENTRANCE_QA.md) and the asset manifest for ownership, dimensions/size and responsive evidence.

## Avatar roster v2 (2026-10-14)
Five selectable characters use files 1–5 from the owner-supplied `avatar assets.zip`. File 6 is intentionally not selectable, following the requested five-character roster. Original portraits are resized to 448×560 WebP (quality 88), with no added artwork, frames or borders. Source rights are supplied by the owner; no third-party licensing claim is made. Circular UI crops use per-character vertical positions in `apps/web/art.tsx`. Versioned URLs prevent stale prior-roster images.

Cloud selection is stored atomically in the existing cosmetics table under the reserved `profile:avatar-v2:` prefix; it requires no database migration or economy activation. Both anonymous and registered identities use the same random first-assignment path. Existing valid pre-update browser selections migrate for older accounts. Local practice stores its independent selection in `avatar:local`. Room snapshots carry public avatar IDs, never private gameplay information. Band Rung is temporarily unavailable in the frontend; its rules and XP data remain intact.

## Owner-supplied lobby music (2026-10-15)
`apps/web/public/audio/lobby-midnight.mp3` is The Midnight Ante, supplied by the owner for lobby use. Optimized from the supplied MP3 to 96 kbps stereo MP3, approximately 1.05 MB / 87.5 seconds. No artwork/audio ownership or third-party license is inferred beyond the owner's supplied-use instruction. The original upload remains unchanged. Loop plays only on the lobby screen, pauses in hidden browser tabs and Android background, and retries browser-blocked autoplay after a user gesture. Sound drawer controls persist locally in the existing settings key. Music defaults on for new installations; existing saved music choices are respected. No gameplay music is enabled by this update.
