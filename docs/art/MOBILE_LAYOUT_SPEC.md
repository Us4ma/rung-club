# Mobile Layout Specification

## Platforms
- Android phones (portrait primary, landscape supported)
- Browsers (desktop and mobile web)

## Core principle
Use the same asset library across Android and web, but do not force the same composition everywhere.

## Lobby
### Desktop
- Sidebar or left navigation is acceptable
- Large mode cards can be displayed in 2x3 grid or equivalent

### Mobile portrait
- Replace persistent sidebar with top bar + bottom nav or compact drawer
- Mode cards become vertically stacked or 2-column at most
- Profile / coins / settings in top row
- Dealer or hero artwork should not consume more than ~30 percent of first viewport height

## Gameplay table
### Desktop
- Full table view with four player positions visible simultaneously
- Right-side emote rail or contextual controls acceptable

### Mobile portrait
- Top opponent and two side opponents shown as compact portrait chips
- Center trick area remains large and uncluttered
- Sar / Rung / current turn indicators grouped in a compact top cluster
- Player hand cannot rely on 13 tiny independent cards in one row
- Use one of:
  1. fanned compact hand + tap to expand card picker
  2. horizontal scroll hand with selected-card enlargement
  3. bottom drawer hand panel with enlarged selected card
- Primary action button must remain above the safe-area inset

### Mobile landscape
- Use wider table composition
- Bottom hand can be slightly larger than portrait
- Avoid clipping opponent portraits into unsafe edges

## Touch targets
- Minimum practical touch target: 44x44 CSS px
- Emotes and small icons must not become untappable on phones

## Performance
- Prefer SVG for lightweight icons and cards where possible
- Use optimized PNG/WebP for rich painterly backgrounds and character art
- Lazy-load nonessential lobby art on slower devices

## Safe areas
- Respect Android notches and bottom gesture insets
- Keep action buttons and player-hand controls out of unsafe areas
