# Table sound design

Dealer announcements remain text only. Table effects use procedural card foley and short tones, with no downloaded assets, speech synthesis, network requests, or paid services. Existing Sound effects preferences control the entire table lane. No gameplay or account rules change.

| Confirmed event | Sound |
| --- | --- |
| Opening shuffle / new five-card deal / redeal | Brief card ruffle |
| Opening comparison cards | Soft individual card taps |
| Caller determined | Short confirmation |
| First five cards; first four; final four | Card packet swishes in seat order |
| Rung selected, or hidden Rung sealed | Short confirmation without disclosing the suit |
| Band Rung revealed, including automatic late reveal | Reveal accent |
| Accepted card play by any seat | Soft card tap |
| Trump takes the lead from the other team | Heavier card tap, replacing the regular tap |
| Completed Sar gathers into the central pile | Gather swish at the animation's 800 ms mark |
| Pile collected by a team | Stack slide and landing at the collection's 1120 ms mark |
| Fifth Sar begins | Single light attention cue |
| Deal ends | Win/defeat sting after the final pile movement |
| Kot / Goon Kot | Special result sting replacing the normal result |

The table has one audio source at a time. Pending cues have short expiry times and a bounded queue; old card taps never accumulate behind a longer result sting. Network acknowledgements and UI clicks do not make a second play sound. Reconnection snapshots and missed batches establish silent baselines. Leaving, muting, hiding the page, and native background events stop the lane. Existing dealer text and table geometry are unchanged.

Sound remains opt-in through the existing settings. Browsers can require an initial interaction before allowing playback. Generated foley is an initial sound palette; recorded card foley can replace the synthesis later without changing the event mapping or queue.

Validation: source review and TypeScript compilation of the changed modules. Automated and gameplay tests intentionally skipped in accordance with the user's existing project instruction.
