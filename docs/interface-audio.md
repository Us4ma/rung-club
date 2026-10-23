# Interface sound feedback

Non-gameplay buttons use the same locally hosted Kenney CC0 Interface Sounds recordings already bundled in the table sprite. No new network audio dependency or paid service is introduced. Source and original license: https://kenney.nl/assets/interface-sounds and docs/third-party/kenney-interface-audio-LICENSE.txt.

- Tap / checkbox / radio: tick_004, existing tick excerpt.
- Open panel / tab / profile: select_003, existing turn excerpt.
- Back / close / cancel / decline: back_004, existing lose excerpt.
- Primary action / submit: confirmation_001, existing reveal excerpt.

Interface effects play at 55% of the existing sprite level. They share the existing single output lane, are dropped while it is busy, and expire after 300 ms rather than accumulating. Rapid duplicate clicks are suppressed. Sound Effects remains opt-in under the existing settings. Browser gesture and foreground protections remain in force.

One delegated click/change observer covers normal screens and portal drawers, including keyboard-generated button activation. Disabled controls, text inputs, range dragging, already-selected tabs, and card/turn controls do not receive extra sounds. Table-toolbar navigation can make UI feedback, but the table's confirmed-event cues, timing and card interactions are unchanged. Muting uses the existing lane clear behavior.
