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
