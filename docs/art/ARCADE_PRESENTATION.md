# Rung Club game presentation

Original emerald, gold and wood presentation inspired by the interaction hierarchy of the supplied game references. No third-party brand or artwork copied.

- Player identity, level badge and XP progress together in the header. Online XP is used when a server profile exists; otherwise practice XP is explicitly labelled. No invented progression or rewards.
- Four functional play modes, prominent Quick Play, solid raised emerald and gold buttons.
- Two-by-two mobile mode layout; desktop emphasizes Quick Play.
- Settings drawer preserves the visible lobby, traps keyboard focus, supports Escape and returns focus. Email linking is revealed on request.
- Rules, authentication, account linking and multiplayer remain functional.

Validation: 50 Vitest tests, 18 Chromium browser tests, production build and Capacitor Android sync passed. This is browser responsive validation, not an APK or real Android device test. Google OAuth still requires the production domains to be authorized in Firebase.

Screenshots: qa-arcade/desktop-lobby.webp, qa-arcade/portrait-lobby.webp, qa-arcade/desktop-settings.webp.
