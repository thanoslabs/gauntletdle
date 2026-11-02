# Gauntletdle architecture

Gauntletdle is a static web application with an optional Manifest V3 Chrome extension. No backend, user accounts, or third-party analytics are required.

## Security boundary
The website owns preferences, the ordered gauntlet, daily results, and sharing. The extension owns navigation to supported games and site-specific completion detection. The website must not trust extension messages without validating sender and payload. The extension must restrict external messaging to the deployed Gauntletdle origin and only request the game hosts it supports.

## Completion flow
1. Open the original game in a browser tab.
2. Detect completion through a game-specific adapter where technically feasible.
3. Capture only result text, puzzle identifier, and completion state.
4. Show a **Next Game** confirmation prompt; never auto-advance by default.
5. If detection fails, offer paste/share-assisted and manual fallback.
6. Skipped or unfinished games share as N/A.

## Planned stacked PRs
- M0: static React/Vite foundation, GitHub Pages, and baseline tests.
- M1: Manifest V3 extension, restricted messaging, tab navigation, and Wordle adapter prototype.
- M2: configurable ordered registry, daily session state, and explicit next-game confirmation.
- M3: game-specific result parsers, share text, skip semantics, and recovery.
- M4: additional games (Sam's Clues, Murdle, Krillion) after checking their URLs, DOMs, and share formats.

## Constraints
Cross-origin iframes are not required. Do not scrape puzzle answers or bypass access controls. Completion extraction is best-effort and must not pretend a result was detected when it was not.
