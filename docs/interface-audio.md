# Interface audio

Lobby and drawer navigation use a dedicated 15 KB mono MP3 sprite at /audio/interface-v2/ui.mp3. Table recordings and event mapping are unchanged.

Source: Kenney UI Audio, https://kenney.nl/assets/ui-audio
Download: https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip
License: CC0; original license shipped beside the sprite.

Mapping: tap = click3; open = switch6; back = reversed switch6; confirm = switch12. Clips are high-pass filtered at 180 Hz, low-pass filtered at 4.6 kHz, softened with short fades and loudness processing, then encoded at 96 kbps. Inter-clip silence prevents bleed.

UI sounds share the existing single audio lane, respect the Sound effects setting and foreground state, and drop while busy instead of overlapping or accumulating. Card controls retain their existing table effects. There are no hover sounds. Browser gesture unlock and silent fallback remain in place.
