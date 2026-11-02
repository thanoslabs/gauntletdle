# Gauntletdle Companion (prototype)

This Manifest V3 extension opens the original Wordle game and observes a possible completion dialog. It does **not** yet extract a verified score, automatically advance, or communicate with the Gauntletdle website. Those features require adapter verification and a secure messaging bridge.

## Load unpacked
1. Visit chrome://extensions in Chrome.
2. Enable Developer mode.
3. Select **Load unpacked** and choose the `extension/` folder.
4. Use the extension popup to open Wordle.

## Privacy and permissions
- Only requests Wordle host access.
- No backend or analytics.
- Stores only a local possible-completion signal.
- Does not collect puzzle answers, keystrokes, or browsing history.

## Next
Verify Wordle DOM selectors and result formats, implement secure website-extension messaging, and show an explicit Next Game confirmation after a validated result.
