# Table sound design

Dealer announcements remain text only. Table effects use locally hosted Kenney CC0 recordings from Casino Audio, Interface Sounds, and Music Jingles. No speech or paid service is used. Existing Sound effects preferences control the entire table lane. No gameplay or account rules change.

| Confirmed event | Sound |
| --- | --- |
| Opening shuffle / new five-card deal / redeal | Brief card ruffle |
| Opening comparison cards | Soft individual card taps |
| Caller determined | Soft confirmation |
| First five cards; first four; final four | Card packet swishes in seat order |
| Rung selected, or hidden Rung sealed | Soft confirmation without disclosing the suit |
| Band Rung revealed, including automatic late reveal | Reveal accent |
| Accepted card play by any seat | Soft card tap |
| Trump takes the lead from the other team | Recorded card placement, replacing the regular slide |
| Completed Sar gathers into the central pile | Gather swish at the animation's 800 ms mark |
| Pile collected by a team | Stack slide and landing at the collection's 1120 ms mark |
| Fifth Sar begins | Single light attention cue |
| Active turn clock enters the red final quarter | One soft tick per second; skipped while another cue plays |
| Deal ends | Win/defeat sting after the final pile movement |
| Kot / Goon Kot | Special result sting replacing the normal result |

The table has one audio source at a time. Pending cues have short expiry times and a bounded queue; old card taps never accumulate behind a longer result sting. Network acknowledgements and UI clicks do not make a second play sound. Reconnection snapshots and multi-Sar catch-up batches establish silent baselines. Card identities deduplicate accepted plays even when revisions arrive in a batch. Suspended browser audio resumes before queued cues are played. Leaving, muting, hiding the page, and native background events stop the lane. Existing dealer text and table geometry are unchanged.

Sound remains opt-in through the existing settings. Browsers can require an initial interaction before allowing playback. The 58 KB MP3 sprite is fetched before entering the table and decoded once. Card placement alternates between two recorded slides. Source clips are trimmed, gently filtered, volume-balanced, and edge-faded; the encoded audio has no clipped samples. The established event timing is retained.

Validation: source review and TypeScript compilation of the changed modules. Automated and gameplay tests intentionally skipped in accordance with the user's existing project instruction.

## Sources and licensing

All recordings are by Kenney, dedicated under CC0 and permitted for commercial use. Original license notices are retained in `docs/third-party/`. Exact clip mapping and excerpt offsets are in `apps/web/public/audio/table-v2/sources.json`.

- Casino Audio: https://kenney.nl/assets/casino-audio
- Interface Sounds: https://kenney.nl/assets/interface-sounds
- Music Jingles: https://kenney.nl/assets/music-jingles

Audio quality verification: decoded the final MP3, checked sample peaks and clipping, and verified sprite offsets and durations. This is signal-level verification, not a claim of on-device listening.
