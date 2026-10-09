# Account resolution and navigation refinement

Registered accounts now resolve their server profile before selecting the lobby or username setup screen. A neutral checking state replaces the premature username form. Failed profile requests offer Retry, Sign out and local practice; they do not falsely infer that a username is missing. Initial configured-account restoration uses the same checking state, avoiding a login/setup flash. The uniqueness and authentication policies are unchanged.

The active avatar roster contains the first six supplied portraits. Retired or invalid device selections fall back to Avatar 1 and are persisted safely. Opponent portrait indices also remain within the six-item roster. Unused portrait assets remain available in the source package.

A new original lightweight SVG atmosphere uses woven emerald felt, thin walnut edges and restrained brass corners. It replaces the illustrated wall and lamps for the lobby and secondary screens. Live controls remain independent layers. The lobby footer now has Profile, Collection and Rules destinations and native English copy; Settings is accessed through the single header gear.

Profile, Collection and Rules omit the lobby logo/XP/settings HUD. Back buttons share an accessible, reusable chevron and brass/emerald treatment, including the table and post-match result. The settings drawer retains the lobby behind its modal overlay.

Validation: production build, 68 Vitest tests and 30 Chromium presentation checks passed. Tests include a delayed existing-account profile request, request failure/retry without username setup, a delayed guest profile not interrupting practice, retained uniqueness checks, six-avatar persistence/fallback, single Settings access, header-free secondary screens and responsive navigation. Existing table, tutorial, drag/drop and loading-screen checks remain active. Capacitor asset sync passed; no APK was generated. No gameplay or backend rule changes.

Screenshots in qa-navigation are captured from the running local app at desktop, portrait and landscape resolutions.
