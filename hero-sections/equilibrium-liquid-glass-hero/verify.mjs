// CLI verification script — headless Chromium checks against the vite preview build.
// Run: node verify.mjs  (expects preview server on http://localhost:4181)
import { chromium } from "playwright";

const URL = "http://localhost:4181/";
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

const browser = await chromium.launch();

// ---------- Desktop viewport ----------
const desktop = await browser.newPage({
	viewport: { width: 1440, height: 900 },
});
const errors = [];
desktop.on("console", (m) => m.type() === "error" && errors.push(m.text()));
desktop.on("pageerror", (e) => errors.push(String(e)));
await desktop.goto(URL, { waitUntil: "networkidle" });

// Video element
const video = desktop.locator("video");
check("video element present", (await video.count()) === 1);
check(
	"video src is BG_VIDEO",
	(await video.getAttribute("src"))?.includes(
		"hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4",
	),
);
check(
	"video autoplay/muted/loop/playsinline",
	await video.evaluate((v) => v.autoplay && v.muted && v.loop && v.playsInline),
);
check(
	"video object-cover full size",
	await video.evaluate((v) => {
		const s = getComputedStyle(v);
		return s.objectFit === "cover" && s.position === "absolute";
	}),
);

// Logo
check(
	'logo "Equilibrium" visible',
	await desktop.getByText("Equilibrium").isVisible(),
);
check(
	"Infinity icon (lucide) rendered",
	(await desktop.locator("nav svg.lucide-infinity").count()) === 1,
);

// Nav pill + links
for (const label of ["Home", "Wellness", "Routine", "Our Team"]) {
	check(
		`nav link "${label}" visible`,
		await desktop.getByRole("button", { name: label }).first().isVisible(),
	);
}
const home = desktop.getByRole("button", { name: "Home" }).first();
check(
	'active "Home" has bg-white/15',
	(await home.getAttribute("class"))?.includes("bg-white/15"),
);
const wellness = desktop.getByRole("button", { name: "Wellness" }).first();
check(
	'"Wellness" has ChevronDown',
	(await wellness.locator("svg.lucide-chevron-down").count()) === 1,
);

// liquid-glass computed styles
const pill = desktop.locator("nav .liquid-glass").first();
check(
	"liquid-glass backdrop-filter blur(4px)",
	await pill.evaluate((el) => {
		const s = getComputedStyle(el);
		const bf = s.backdropFilter || s.webkitBackdropFilter;
		return bf === "blur(4px)";
	}),
);
check(
	"liquid-glass ::before gradient border",
	await pill.evaluate((el) => {
		const s = getComputedStyle(el, "::before");
		return (
			s.content === '""' &&
			s.padding === "1.4px" &&
			s.backgroundImage.includes("linear-gradient")
		);
	}),
);

// Desktop CTAs
check(
	'"Log in" visible',
	await desktop.getByRole("button", { name: "Log in" }).first().isVisible(),
);
check(
	'"Begin Now" visible',
	await desktop.getByRole("button", { name: "Begin Now" }).first().isVisible(),
);

// Hero content
check(
	"h1 text correct",
	(await desktop.locator("h1").textContent())?.trim() ===
		"Live Better, Feel Whole Every Day",
);
check(
	"paragraph text correct",
	(await desktop.locator("p").first().textContent())
		?.replace(/\s+/g, " ")
		.trim() ===
		"Take charge of how you feel with a companion built for your journey—build routines, follow your growth, and unlock tailored insights for a steadier, more vibrant life each day.",
);
check(
	'"Start Today" visible',
	await desktop.getByRole("button", { name: "Start Today" }).isVisible(),
);
check(
	'"Discover How" visible',
	await desktop.getByRole("button", { name: "Discover How" }).isVisible(),
);

// Geist font applied
check(
	"Geist font applied to h1",
	await desktop
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontFamily.startsWith("Geist")),
);

// Mobile hamburger hidden on desktop
check(
	"mobile toggle hidden on desktop",
	await desktop
		.locator("nav > button.md\\:hidden")
		.evaluate((el) => getComputedStyle(el).display === "none"),
);

check(
	"no console/page errors (desktop)",
	errors.length === 0,
	errors.join("; "),
);
await desktop.close();

// ---------- Mobile viewport ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mErrors = [];
mobile.on("console", (m) => m.type() === "error" && mErrors.push(m.text()));
mobile.on("pageerror", (e) => mErrors.push(String(e)));
await mobile.goto(URL, { waitUntil: "networkidle" });

const toggle = mobile.locator("nav > button.md\\:hidden");
check("mobile toggle visible", await toggle.isVisible());
check(
	"nav pill hidden on mobile",
	await mobile
		.locator("nav .liquid-glass.hidden")
		.first()
		.evaluate((el) => getComputedStyle(el).display === "none"),
);
check(
	"mobile menu closed initially",
	(await mobile.locator("div.top-\\[72px\\]").count()) === 0,
);

await toggle.click();
const menu = mobile.locator("div.top-\\[72px\\]");
check("mobile menu opens on click", await menu.isVisible());
check(
	"mobile menu has 4 nav links + 2 CTAs",
	(await menu.locator("button").count()) === 6,
);
check(
	"toggle shows X when open",
	(await toggle.locator("svg.lucide-x").count()) === 1,
);

await toggle.click();
check(
	"mobile menu closes on second click",
	(await mobile.locator("div.top-\\[72px\\]").count()) === 0,
);
check(
	"toggle shows Menu when closed",
	(await toggle.locator("svg.lucide-menu").count()) === 1,
);

check(
	"no console/page errors (mobile)",
	mErrors.length === 0,
	mErrors.join("; "),
);
await mobile.close();
await browser.close();

// ---------- Report ----------
let failed = 0;
for (const r of results) {
	if (!r.ok) failed++;
	console.log(
		`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`,
	);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
