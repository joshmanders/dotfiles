---
name: screenshot
description: Use when a rendered visual would help — verifying a change renders, checking code output by eye instead of a test run, capturing a bug repro or a visual for a PR. Drives a real running web app in headless Chromium via a reusable Playwright runner and writes a PNG.
user-invocable: false
---

# Screenshot

This is a general visual-capture tool: reach for it whenever seeing the rendered result would help. Verifying that code does what you expect by looking at the result rather than spinning up a test suite, confirming a change renders, capturing a bug repro, grabbing a visual for a PR or a message — any reason a rendered visual is useful. The output is a PNG.

This skill is the generic engine: a reusable runner (`screenshot.mjs`) plus a per-shot driver you write. Project-specific setup — auth, seeding, the dev URL, framework-specific state tricks — lives in a project's own `taking-screenshots` skill that references this one and layers those specifics on top. Keep that customization out of here.

---

## Prerequisites

The only real prerequisite is that `playwright` is installed in the project's `node_modules` — the runner is run from the project root and resolves it from there. Assume it is if the project documents screenshots.

The driver navigates to whatever URL you give it. Any URL that resolves works — a deployed site, a local dev server, anything reachable. `ignoreHTTPSErrors` covers local self-signed certs, so localhost works too.

---

## The runner

`screenshot.mjs` (alongside this skill) launches headless Chromium, imports your driver, runs it against a `page`, and writes one PNG. You don't edit it — you write a driver and pass it in.

Fixed behavior worth knowing:

- Default viewport is 1400x1100.
- `ignoreHTTPSErrors` is on at context creation (can't be changed later), so local self-signed certs work without extra setup.
- Page errors and console errors are echoed to stdout, so a broken page shows up in the run output.
- One driver produces one screenshot.

---

## Write a driver

A driver is a throwaway `*.mjs` in the project root that default-exports `async (page) => {}`. It owns everything about reaching the target state — it hardcodes its own URL, does its own navigation and waiting, and can call `page.setViewportSize()` for a non-default viewport.

Minimal viewport shot:

```js
export default async (page) => {
  await page.goto('https://example.com/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
};
```

A driver that never calls `page.capture()` gets a viewport shot — what you'd get screenshotting a page by hand. To customize, call `page.capture()` — it's a side-effect setter the runner injects, and you only need it when customizing:

```js
export default async (page) => {
  await page.goto('https://example.com/settings', { waitUntil: 'networkidle' });
  page.capture({ selector: '#panel' });   // element shot
  // page.capture({ clip: { x: 0, y: 0, width: 800, height: 600 } });  // region
  // page.capture({ fullPage: true });     // the whole page
};
```

The driver's return value is ignored.

---

## Invoke

Run from the project root:

```bash
node ~/.claude/skills/screenshot/screenshot.mjs ./shot.mjs [outPath]
```

The out-path defaults to an auto-timestamped file under `/tmp`. Pass a second argument to override it.

---

## Copy to clipboard

If the screenshot needs to be on the clipboard (e.g. to paste into a PR or a message), use `osascript`:

```bash
osascript -e 'set the clipboard to (read (POSIX file "/tmp/out.png") as «class PNGf»)'
```

Verify it landed — the output should lead with `«class PNGf»` and a byte count:

```bash
osascript -e 'clipboard info'
```

`pbcopy` is text-only and copies the file path, not the image, so it won't work here.

---

## Clean up

Delete the throwaway driver script when it's no longer needed so it doesn't pollute the working tree.
