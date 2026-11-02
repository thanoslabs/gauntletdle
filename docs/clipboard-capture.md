# Copy-event capture

The Wordle adapter observes `copy` events and also installs a narrow MAIN-world wrapper around `navigator.clipboard.writeText()` on the explicitly permitted Wordle page. The wrapper calls the native API first and reports only recognizable Wordle share text after a successful write. It reads `event.clipboardData.getData("text/plain")` and forwards only recognized Wordle share text. The background script independently validates the sender's URL and parses the share text again before storing it.

The website requests pending results through the restricted bridge. A result is offered for review; it is not automatically marked complete or advanced. The player may accept or ignore it.

## Limitations

Modern games often call `navigator.clipboard.writeText()`, which does not emit a DOM `copy` event; the optional MAIN-world wrapper attempts to cover this case but may be bypassed by site changes or non-writable APIs. Even on a copy event, `clipboardData` may be empty because the browser populates the clipboard after the listener runs. This approach is best-effort, not guaranteed Wordle auto-import. Manual paste remains available. Do not request broad clipboard-read permissions or monitor other sites.

## Manual test

Load the unpacked extension, visit Wordle, finish a puzzle, and click Share. Return to Gauntletdle, click Refresh captured result, and accept if offered. If nothing appears, paste the copied result manually. Test unrelated copied text to ensure it is ignored.
