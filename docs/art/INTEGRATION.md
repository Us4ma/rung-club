# Premium art integration

The owner-supplied `RungClub_Final_Art_Package_v6` is the visual source: emerald felt, walnut, brass/gold, global illustrated portraits. Runtime assets are under `apps/web/public/art/`, preserving logical card/avatar/UI groups. `asset-manifest.json` records sources, formats (path suffix), sizes, hashes and provenance. The source license and mobile specification are included alongside this document.

## Presentation

- Welcome and lobby use an original female dealer derived from the supplied style. Tutorial uses the same host as a compact guide. She is never a fifth gameplay seat.
- The table is a cleaned derivative of the supplied emerald table. Baked-in deck, card slots, profile icons and seat boxes were removed through image editing. All hands, played cards, scores, trump, turns and identities remain live DOM overlays.
- 52 supplied card fronts are exported as WebP, preserving court illustrations. Their accessible names remain live rank/suit text. Vector card backs, UI skins, icons and badges retain their original design. UI skin SVGs set `preserveAspectRatio="none"` to stretch with responsive controls.
- The supplied 12 global portraits form the selectable local roster. Selection and four included card-back themes persist on this device. These are free starter cosmetics, with no economy enabled. Other-player avatars are presentation defaults; synced online avatar ownership is not implemented.
- Quick reactions use the existing server-permitted preset messages, illustrated with the supplied emotes. No new free-text channel was introduced.
- Desktop has house navigation and layered panels. Phones hide the sidebar, stack the modes, cap dealer artwork height, and use bottom navigation. Portrait hands scroll horizontally with 76 × 106 CSS pixel cards; selected cards rise before confirmation. Landscape uses a wider table and compact controls beside it. Gesture insets are respected through `viewport-fit=cover` and CSS safe-area padding. Very small screens can scroll vertically to the hand.
- Sorting only changes display order. Core rules, AI and authoritative server source are unchanged.

## Generated asset prompts

Built-in image generation was used; no paid API or required service was introduced.

Female dealer: single adult professional female dealer, dark wavy hair, warm confident smile, emerald velvet waistcoat with restrained gold embroidery over an ivory blouse, elegant jewelry, one welcoming open hand and a fan of cards in the other. Three-quarter waist-up painted game sprite, warm amber rim light, clean silhouette and real transparent alpha. Supplied approved style reference and premium male pose were used for art direction and uniform tailoring, respectively. No text/UI/table/backdrop. The resulting sprite is `characters/dealer-female.webp`.

Clean table: preserve the supplied top-down emerald table, walnut, lanterns, plants and gold edge filigree. Remove baked-in cards, card slots and all four seat labels/profile icons, replacing those areas with matching felt. Keep the ornamental spade crest. No gameplay objects or counters. Result: `tables/emerald-clean.webp`.

Lounge: the supplied backgrounds are blurred table views rather than clean lounge layers. Generate a matching wide walnut-paneled card-house interior with emerald velvet chairs, carved brass details, warm lanterns, plants, restrained dark center for real UI overlays. No people, cards, avatars, logos, text or controls. Result: `backgrounds/lounge.webp`.

## Reproduce and verify

```
npm ci
npm test
npm run test:e2e
npx playwright install chromium
npm run test:visual
npm run build
npm run typecheck:worker
npm run android:sync
```

For a preinstalled browser, set `BROWSER_EXECUTABLE_PATH` to its executable. `QA_SCREENSHOT_DIR` changes the viewport screenshot output directory. The visual suite uses a fresh browser per test when a custom constrained runtime is selected. No browser runtime was added to production dependencies.

The Android wrapper receives the same built assets through Capacitor sync. This verifies source/asset packaging, not native rendering or an APK. Actual Android debug builds and device performance checks still require the free Android SDK/JDK setup described in SETUP.md. Live Firebase room creation also remains a separate deployment check.
