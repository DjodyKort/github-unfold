# Security policy

## Reporting a vulnerability

Please report security issues privately via GitHub's
[private vulnerability reporting](https://github.com/DjodyKort/github-unfold/security/advisories/new)
rather than a public issue. You'll get an acknowledgement as soon as possible.

## Scope & posture

GitHub Unfold is a content script that runs only on `https://github.com/*`. It:

- requests only the `storage` permission and the `github.com` host permission;
- ships no remote code — everything is bundled at build time;
- makes no network requests of its own (it only triggers GitHub's own "Load more");
- stores only local settings and expansion counts via `browser.storage`.

The sentinel and E2E tooling use `bypassCSP` and load the unpacked extension in a
test browser only; that never ships to users.
