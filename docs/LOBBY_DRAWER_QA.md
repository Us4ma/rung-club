# Lobby drawer and profile cleanup — 11 October 2026

- Settings uses a real full-screen dismissal backdrop, above the lobby and behind the modal drawer. Outside pointer/touch taps close it without activating the lobby underneath.
- Opening and closing use short 180 ms drawer and shade animations. Dismissal through the backdrop, Back to lobby or Escape shares the same exit transition. Reduced motion and the Animations setting disable the transition. Focus trapping, scroll lock and focus restoration remain intact.
- Phone drawers leave a 24 px outside strip for dismissal.
- Profile no longer renders achievements or match-history entries. Existing statistics, account controls, backend history and progression remain unchanged.
- Settings Replay Tutorial is hidden when saved onboarding status is `skipped`. Rules/learning content remains available.

Validation: 150 unit tests; 34 selected browser regressions covering desktop/phone outside dismissal, Escape, skipped FTUE, profile cleanup, settings, account lifecycle, hand controls and entrance layouts; production build and Capacitor Android asset sync. No backend or gameplay rules changed. No Android APK/device run claimed.
