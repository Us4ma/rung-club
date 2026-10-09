# Premium art QA

Verified locally:

- 38 existing Vitest tests, including rules/security invariants.
- 2 real local multiplayer HTTP/WebSocket integration tests.
- 5 Chromium presentation tests: desktop 1440×1000, portrait 390×844, landscape 844×390, small phone 320×640, and profile/collection/Band/tutorial flow.
- All 52 card fronts decode in the browser. Every one of 132 runtime art assets has verified nonzero content and SHA-256 manifest entries; all WebP exports decode with Pillow.
- 13-card hands scroll/select/submit correctly; no horizontal document overflow in tested viewports. Landscape may scroll vertically on short displays.
- Avatar selection persists after reload; four card backs equip without currency.
- Browser console has no uncaught application errors in tested hand flows.
- TypeScript/Vite production build, Worker typecheck and Wrangler dry-run.
- Capacitor Android asset sync completed. No APK or physical Android device QA.

The first asset conversion produced several empty files. Validation caught them, and they were re-exported and checked before packaging. Initial SVG skins letterboxed; responsive SVG fitting was corrected. Mobile hero height and landscape pile placement were adjusted after screenshot inspection.

Screenshots in `qa/` are captured from the running app, not mockups. UI screenshots use random practice deals. Core rules, AI, protocol and authoritative server source were not modified in this integration.

Cloudflare/Firebase authenticated room creation and native hardware performance remain unverified. Google linking was deferred by the owner. No ads, billing or paid assets were enabled.
