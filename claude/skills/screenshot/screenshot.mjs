#!/usr/bin/env node
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [driverPath, outPath = `/tmp/screenshot-${Date.now()}.png`] = process.argv.slice(2);
if (!driverPath) { console.error('usage: screenshot.mjs <driver.mjs> [outPath]'); process.exit(1); }

// Resolve playwright from the project the runner is invoked in, not from the runner's own location.
const require = createRequire(pathToFileURL(process.cwd() + '/'));
const { chromium } = require('playwright');

const drive = (await import(pathToFileURL(resolve(driverPath)).href)).default;
if (typeof drive !== 'function') { console.error(`${driverPath} must default-export a (page) => … function`); process.exit(1); }

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 1100 }, ignoreHTTPSErrors: true });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGE ERR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });

let shot = null;
page.capture = (opts = {}) => { shot = { ...opts }; };

await drive(page);

const spec = shot ?? {};
if (spec.selector) await page.locator(spec.selector).screenshot({ path: outPath });
else await page.screenshot({ path: outPath, fullPage: spec.fullPage ?? false, clip: spec.clip });

await browser.close();
console.log('wrote', outPath);
