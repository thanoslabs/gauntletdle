# Extension bridge

The extension injects a content script on the exact Gauntletdle GitHub Pages origin. It receives only three allowlisted commands: PING, OPEN_WORDLE, GET_WORDLE_CANDIDATE. It does not expose a generic browser API to the page.

The bridge uses window.postMessage because a normal webpage cannot call chrome.runtime directly without externally_connectable. Both sides validate message origin and request IDs. The extension never accepts arbitrary URLs to open.

The bridge is an untrusted-page boundary: future actions must not expose privileged data or accept arbitrary hostnames. No result is considered verified solely from a DOM candidate.

For local development, add an explicit localhost match to the unpacked manifest; do not ship wildcard host permissions.
