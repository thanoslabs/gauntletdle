# Adding a new game

## Manual-only games (no extension changes)
1. Add a GameDefinition to `src/games.ts` with a unique stable ID, display name, HTTPS game URL, and `capture: ["manual"]`.
2. Run `npm test` and `npm run build`.
3. Verify opening the game, skipping, and sharing an N/A result.

## Games with share-text parsing
1. Add a pure parser in `src/game-parsers.ts` and register it by stable parser ID.
2. Add `parser` to the game definition and include `"share"` in capture.
3. Add examples for success, loss, malformed input, and puzzle number in parser tests.
4. Keep the original share text for user inspection; never invent a score.

## Games with extension capture
1. Create a site-specific adapter under `extension/adapters/`.
2. Add the exact HTTPS domain/path to `extension/manifest.json` content scripts and permissions where required.
3. Add `adapter` to the game definition and `"extension"` to capture.
4. Route only allowlisted game IDs through the extension. Never accept arbitrary URLs or page-provided JavaScript.
5. Verify against the real site and test an offline completion fixture.
6. Offer a manual fallback when the DOM changes.

## Design rules
- The website is the source of truth for the game order and results.
- Stable game IDs must never be renamed casually; they are used in local storage.
- Keep adapters independent of the gauntlet UI and each other.
- A manifest does not imply automatic capture works.
- The extension requires a new release when its site permissions or content scripts change.
- No backend or account is required.
