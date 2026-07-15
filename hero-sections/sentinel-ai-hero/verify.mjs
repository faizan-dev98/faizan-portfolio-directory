/**
 * Headless verification for the SENTINEL AI hero page.
 * Run: node verify.mjs [url]  (defaults to http://localhost:4173)
 */
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:4173";
const failures = [];
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures.push(name);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

// --- Document & font ---
check(
	"title mentions SENTINEL AI",
	(await page.title()).includes("SENTINEL AI"),
);
const bodyStyles = await page.evaluate(() => {
	const s = getComputedStyle(document.body);
	return { font: s.fontFamily, bg: s.backgroundColor };
});
check("body uses Sora", bodyStyles.font.includes("Sora"), bodyStyles.font);
check(
	"body background is dark charcoal (hsl 0 0% 10% ≈ rgb 26)",
	bodyStyles.bg === "rgb(26, 26, 26)",
	bodyStyles.bg,
);

// --- Navbar ---
const nav = page.locator("header");
check(
	"navbar is fixed",
	(await nav.evaluate((el) => getComputedStyle(el).position)) === "fixed",
);
check(
	"logo says SENTINEL",
	(
		await nav.locator("a", { hasText: "SENTINEL" }).first().textContent()
	)?.trim() === "SENTINEL",
);
const links = nav.locator("nav a");
check("5 nav links", (await links.count()) === 5);
const hrefs = await links.evaluateAll((els) =>
	els.map((a) => a.getAttribute("href")),
);
check(
	"nav hrefs are #section-name anchors",
	JSON.stringify(hrefs) ===
		JSON.stringify([
			"#services",
			"#about-us",
			"#projects",
			"#team",
			"#contacts",
		]),
	hrefs.join(", "),
);
const quote = nav.getByRole("button", { name: "Get Quote" });
check("Get Quote button exists", (await quote.count()) === 1);
check(
	"Get Quote uses nav-button bg (hsl 0 0% 18% ≈ rgb 46)",
	(await quote.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
		"rgb(46, 46, 46)",
);

// --- Hero heading & green accent ---
const h1 = page.locator("h1");
check(
	"h1 reads SENTINEL AI",
	/SENTINEL\s+AI/.test((await h1.textContent()) ?? ""),
);
const spanColor = await h1
	.locator("span")
	.evaluate((el) => getComputedStyle(el).color);
const [r, g, b] = spanColor.match(/\d+/g).map(Number);
check(
	"AI span is vivid green (hsl 119 99% 46%)",
	g > 200 && r < 30 && b < 30,
	spanColor,
);

// --- Copy ---
for (const text of [
	"We implement security correctly.",
	"Enterprise security systems built in days",
	"Trusted security partner. Columbus, OH. 12 systems deployed.",
]) {
	check(
		`copy present: "${text.slice(0, 40)}…"`,
		(await page.getByText(text, { exact: false }).count()) >= 1,
	);
}

// --- CTAs & pointer-events strategy ---
for (const name of ["Book a Call", "Our Work"]) {
	const btn = page.getByRole("button", { name });
	check(`CTA "${name}" exists`, (await btn.count()) === 1);
	check(
		`CTA "${name}" is clickable (pointer-events auto)`,
		(await btn.evaluate((el) => getComputedStyle(el).pointerEvents)) === "auto",
	);
}
check(
	"content container passes clicks through (pointer-events none)",
	(await page
		.locator("section > div.relative.z-10")
		.evaluate((el) => getComputedStyle(el).pointerEvents)) === "none",
);

// --- Layout: full-screen section, content at bottom ---
const layout = await page.evaluate(() => {
	const section = document.querySelector("section");
	const s = getComputedStyle(section);
	return {
		height: section.getBoundingClientRect().height,
		alignItems: s.alignItems,
		overflow: s.overflow,
		bg: s.backgroundColor,
	};
});
check(
	"section fills viewport (>= 900px)",
	layout.height >= 900,
	`${layout.height}px`,
);
check(
	"section aligns content to bottom (items-end)",
	layout.alignItems === "flex-end",
);
check(
	"section bg is hero-bg (hsl 0 0% 8% ≈ rgb 20)",
	layout.bg === "rgb(20, 20, 20)",
	layout.bg,
);

// --- Animations resolved (opacity-0 → animate-fade-up forwards) ---
await page.waitForTimeout(2500);
const h1Opacity = await h1.evaluate((el) => getComputedStyle(el).opacity);
check(
	"h1 fade-up completed (opacity 1)",
	h1Opacity === "1",
	`opacity=${h1Opacity}`,
);

// --- Spline canvas (lazy-loaded 3D scene) ---
let canvasOk = false;
try {
	await page.waitForSelector("canvas", { timeout: 45_000 });
	canvasOk = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		return !!c && c.getBoundingClientRect().width > 0;
	});
} catch {
	canvasOk = false;
}
check("Spline canvas rendered", canvasOk);

check("no page errors", consoleErrors.length === 0, consoleErrors.join(" | "));

await page.screenshot({ path: "/tmp/sentinel-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const mobileNavHidden = await page.evaluate(() => {
	const navEl = document.querySelector("header nav");
	return getComputedStyle(navEl).display === "none";
});
check("nav links hidden on mobile", mobileNavHidden);
await page.screenshot({ path: "/tmp/sentinel-mobile.png" });

await browser.close();

if (failures.length) {
	console.error(`\n${failures.length} check(s) failed`);
	process.exit(1);
}
console.log("\nAll checks passed ✅");
