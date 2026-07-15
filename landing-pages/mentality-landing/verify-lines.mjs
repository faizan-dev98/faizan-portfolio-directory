import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome", headless: true });
let failures = 0;
for (const width of [1440, 1280, 1024, 834]) {
	const page = await browser.newPage({ viewport: { width, height: 900 } });
	await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
	await page.waitForTimeout(1200);
	const r = await page.evaluate(() => {
		const h1 = document.querySelector("h1");
		const s = getComputedStyle(h1);
		const lh = parseFloat(s.lineHeight);
		return {
			lines: Math.round(h1.getBoundingClientRect().height / lh),
			fs: s.fontSize,
		};
	});
	const ok = r.lines === 3;
	if (!ok) failures++;
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${width}px viewport: h1 renders ${r.lines} lines (font ${r.fs})`,
	);
	await page.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
