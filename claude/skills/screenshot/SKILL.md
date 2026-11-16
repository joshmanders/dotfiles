---
name: screenshot
description: Use when a rendered visual would help — verifying a change renders, checking code output by eye instead of a test run, capturing a bug repro or a visual for a PR. Drives a real running web app in headless Chromium via a reusable Playwright runner and writes a PNG.
user-invocable: false
---

# Screenshot

Generic engine: the runner `screenshot.mjs` (next to this file) plus a throwaway driver you write. Project specifics (auth, seeding, dev URL, framework state tricks) belong in that project's own `taking-screenshots` skill, not here.

**Prerequisite:** `playwright` in the project's `node_modules`; the runner resolves it from the cwd. Assume it's there if the project documents screenshots. Any reachable URL works, including localhost with self-signed certs.

## Runner behavior

- Headless Chromium, default viewport 1400x1100.
- `ignoreHTTPSErrors` is set at context creation and can't be changed.
- Page errors and console errors are echoed to stdout.
- One driver → one PNG. Don't edit the runner.

## Driver

A throwaway `*.mjs` in the project root that default-exports `async (page) => {}`. It hardcodes its URL, navigates, waits, and may call `page.setViewportSize()`. Return value is ignored.

```js
export default async (page) => {
  await page.goto('https://example.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
};
```

Without `page.capture()` you get a viewport shot. The runner injects `page.capture()` as a setter to customize:

```js
page.capture({ selector: '#panel' });                              // element
page.capture({ clip: { x: 0, y: 0, width: 800, height: 600 } });  // region
page.capture({ fullPage: true });                                  // whole page
```

## Run

From the project root:

```bash
node ~/.claude/skills/screenshot/screenshot.mjs ./shot.mjs [outPath]
```

`outPath` defaults to a timestamped file under `/tmp`.

## Clipboard

`pbcopy` copies only the path. For the image:

```bash
osascript -e 'set the clipboard to (read (POSIX file "/tmp/out.png") as «class PNGf»)'
osascript -e 'clipboard info'   # verify: output leads with «class PNGf» and a byte count
```

Delete the driver when done.
