/* Renders src/assets/logo.png — the Power AI navbar logo — as a transparent
   PNG at 3x scale (rendered 288x96, displayed at 32px tall) using headless
   Chromium. Usage: node scripts/make-logo.mjs */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "src", "assets");
const outFile = path.join(outDir, "logo.png");

/* A spark/bolt mark in the headline gradient (amber → purple → indigo)
   inside a liquid-glass rounded square, plus a "Power AI" General Sans
   wordmark. 96px tall at 3x → crisp at the navbar's 32px. */
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; }
  body { background: transparent; }
  #logo {
    display: inline-flex;
    align-items: center;
    gap: 21px;
    height: 96px;
    padding-right: 6px;
  }
  .mark {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 27px;
    background:
      radial-gradient(120% 120% at 20% 0%, rgba(252, 211, 77, 0.22) 0%, rgba(252, 211, 77, 0) 45%),
      radial-gradient(140% 140% at 85% 100%, rgba(99, 102, 241, 0.38) 0%, rgba(99, 102, 241, 0) 60%),
      rgba(255, 255, 255, 0.04);
    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.14);
    overflow: hidden;
  }
  .mark::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 3px;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.16) 25%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0.16) 75%,
      rgba(255, 255, 255, 0.5) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
  }
  .mark svg { position: absolute; inset: 0; }
  .word {
    font-family: "General Sans", sans-serif;
    font-size: 54px;
    font-weight: 600;
    letter-spacing: -0.024em;
    color: hsl(40 6% 95%);
    line-height: 1;
    white-space: nowrap;
  }
  .word .ai {
    background-image: linear-gradient(to left, #6366f1, #a855f7, #fcd34d);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
</style>
</head>
<body>
  <div id="logo">
    <div class="mark">
      <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bolt" x1="68" y1="18" x2="30" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fcd34d" />
            <stop offset="0.5" stop-color="#a855f7" />
            <stop offset="1" stop-color="#6366f1" />
          </linearGradient>
        </defs>
        <path d="M54 16 L30 54 H46 L42 80 L66 42 H50 Z" fill="url(#bolt)" />
      </svg>
    </div>
    <div class="word">Power&nbsp;<span class="ai">AI</span></div>
  </div>
</body>
</html>`;

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.locator("#logo").screenshot({ path: outFile, omitBackground: true });
await browser.close();

console.log(`Wrote ${outFile}`);
