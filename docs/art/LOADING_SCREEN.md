# Immediate card loading screen

The document includes original emerald/gold CSS cards and typography, with no image, font, engine or framework download needed to display them. Three cards shuffle sideways using transforms. Portrait, desktop and short landscape layouts share the same visual system. Reduced-motion users see a static card fan.

A small bootstrap entry dynamically imports the React application. The HTML screen persists outside the root until the app commits and reaches its first animation frame. It then fades for 180 ms, without any minimum wait or simulated percentage. The application root is inert and hidden from assistive technology until ready. Import failures display an actionable retry. Slow connections receive a message and retry after eight seconds; that timeout does not delay successful loading.

Firebase authentication now loads through an asynchronous adapter. Identity restoration starts in the background after React mounts. Authentication functions and account linking retain their previous behavior and tests. The game engine remains deferred until a table opens. Local practice does not download Firebase when cloud configuration is absent. The old logo-based React splash and its 1.5-second fallback are removed.

Measured production bundles, uncompressed: bootstrap 3.31 KB, app 52.86 KB (previously 171 KB), deferred auth 116.78 KB, React 218.75 KB, deferred Phaser 1,374 KB. These are bundle sizes, not claims about real-world connection speeds. No paid service, new dependency, raster asset or gameplay change was introduced.

Validation: production build passed; 65 Vitest tests and 27 Chromium presentation tests passed. New browser tests hold the app module request and confirm the loading screen renders first, verify no startup Phaser download, then enter a playable table. They also check failure/retry and reduced motion. Capacitor Android asset sync passed; no new APK was built. QA screenshots hold the module request to make the otherwise brief loading state visible.

The optional legacy single-file offline bundle command still cannot resolve existing absolute /art URLs in its CSS; this pre-existing export limitation does not affect the Vite web build or Capacitor assets.
