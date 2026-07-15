/**
 * CLI verification for the Datacore video hero.
 * Run: node scripts/verify.mjs (expects `vite preview` serving dist on port 4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4173";
let failures = 0;

function check(name, condition, detail = "") {
	const ok = Boolean(condition);
	if (!ok) failures += 1;
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	return ok;
}

const browser = await chromium.launch();

// ---------- Desktop (1440x900) ----------
const desktop = await browser.newPage({
	viewport: { width: 1440, height: 900 },
});
const pageErrors = [];
desktop.on("pageerror", (err) => pageErrors.push(err.message));
await desktop.goto(BASE_URL, { waitUntil: "load" });
await desktop.waitForTimeout(1500); // let entrance animations settle

check(
	"No uncaught page errors",
	pageErrors.length === 0,
	pageErrors.join("; "),
);

// Background video
const video = desktop.locator("video");
check("Video element present", (await video.count()) === 1);
check(
	"Video src is the local mp4",
	(await video.getAttribute("src"))?.includes(
		"/assets/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4",
	),
);
check(
	"Video autoplay/muted/loop/playsinline",
	await video.evaluate((v) => v.autoplay && v.muted && v.loop && v.playsInline),
);
check(
	"Video covers viewport (absolute, object-cover, full size)",
	await video.evaluate((v) => {
		const s = getComputedStyle(v);
		const r = v.getBoundingClientRect();
		return (
			s.position === "absolute" &&
			s.objectFit === "cover" &&
			r.width >= window.innerWidth &&
			r.height >= window.innerHeight
		);
	}),
);
check(
	"No overlay on top of video (opaque)",
	await video.evaluate((v) => {
		// No sibling overlay div sits between the video and the content layers
		const siblings = [...v.parentElement.children].filter((el) => el !== v);
		return (
			getComputedStyle(v).opacity === "1" &&
			siblings.every((el) => ["HEADER", "SECTION"].includes(el.tagName))
		);
	}),
);
check(
	"min-h-screen on hero container",
	await desktop
		.locator("main")
		.evaluate((m) => m.getBoundingClientRect().height >= window.innerHeight),
);

// Fonts loaded
await desktop.evaluate(() => document.fonts.ready);
for (const font of ["Manrope", "Cabin", "Instrument Serif", "Inter"]) {
	check(
		`Font loaded: ${font}`,
		await desktop.evaluate((f) => document.fonts.check(`16px "${f}"`), font),
	);
}

// Navbar
const header = desktop.locator("header");
check(
	"Navbar is z-20 + transparent",
	await header.evaluate((h) => {
		const s = getComputedStyle(h);
		return s.zIndex === "20" && s.backgroundColor === "rgba(0, 0, 0, 0)";
	}),
);
check(
	"Logo SVG path starts with spec segment, filled white",
	await desktop.evaluate(() => {
		const p = document.querySelector("header svg path");
		return (
			p?.getAttribute("d")?.startsWith("M1.04356 6.35771L13.6437 0.666504") &&
			p?.getAttribute("fill") === "white"
		);
	}),
);
for (const link of ["Home", "Services", "Reviews", "Contact us"]) {
	const el = desktop.locator(
		`header nav[aria-label="Primary"] a:has-text("${link}")`,
	);
	check(`Nav link "${link}" visible`, await el.isVisible());
}
check(
	"Nav links: Manrope 14px medium white",
	await desktop.evaluate(() => {
		const a = [
			...document.querySelectorAll('header nav[aria-label="Primary"] a'),
		][0];
		const s = getComputedStyle(a);
		return (
			s.fontFamily.includes("Manrope") &&
			s.fontSize === "14px" &&
			s.fontWeight === "500" &&
			s.color === "rgb(255, 255, 255)"
		);
	}),
);
check(
	"Services has ChevronDown icon",
	(await desktop
		.locator('header nav[aria-label="Primary"] a:has-text("Services") svg')
		.count()) === 1,
);

const signIn = desktop.locator("header > div button", { hasText: "Sign In" });
const getStarted = desktop.locator("header > div button", {
	hasText: "Get Started",
});
check(
	'"Sign In" visible, white bg, #d4d4d4 border, 8px radius, #171717 text',
	await signIn.evaluate((b) => {
		const s = getComputedStyle(b);
		return (
			s.backgroundColor === "rgb(255, 255, 255)" &&
			s.borderColor === "rgb(212, 212, 212)" &&
			s.borderRadius === "8px" &&
			s.color === "rgb(23, 23, 23)" &&
			s.fontWeight === "600" &&
			s.fontSize === "14px"
		);
	}),
);
check(
	'"Get Started" visible, #7b39fc bg, 8px radius, #fafafa text, shadow',
	await getStarted.evaluate((b) => {
		const s = getComputedStyle(b);
		return (
			s.backgroundColor === "rgb(123, 57, 252)" &&
			s.borderRadius === "8px" &&
			s.color === "rgb(250, 250, 250)" &&
			s.boxShadow !== "none"
		);
	}),
);
check(
	"Hamburger hidden on desktop",
	!(await desktop.locator('button[aria-label="Open menu"]').isVisible()),
);

// Tagline pill
const pill = desktop.locator("section > div").first();
check(
	"Pill: 38px tall, 10px radius, glass bg + blur + border",
	await pill.evaluate((el) => {
		const s = getComputedStyle(el);
		return (
			el.getBoundingClientRect().height === 38 &&
			s.borderRadius === "10px" &&
			s.backgroundColor === "rgba(85, 80, 110, 0.4)" &&
			s.borderColor === "rgba(164, 132, 215, 0.5)" &&
			(s.backdropFilter || s.webkitBackdropFilter).includes("blur")
		);
	}),
);
check(
	'Pill badge: "New", #7b39fc bg, 6px radius',
	await desktop.evaluate(() => {
		const badge = [...document.querySelectorAll("section span")].find(
			(el) => el.textContent === "New",
		);
		if (!badge) return false;
		const s = getComputedStyle(badge);
		return (
			s.backgroundColor === "rgb(123, 57, 252)" && s.borderRadius === "6px"
		);
	}),
);
check(
	'Pill text "Say Hello to Datacore v3.2" in Cabin 14px',
	await desktop.evaluate(() => {
		const t = [...document.querySelectorAll("section span")].find(
			(el) => el.textContent === "Say Hello to Datacore v3.2",
		);
		if (!t) return false;
		const s = getComputedStyle(t);
		return (
			s.fontFamily.includes("Cabin") &&
			s.fontSize === "14px" &&
			s.fontWeight === "500"
		);
	}),
);

// Headline
const h1 = desktop.locator("h1");
check(
	"H1 text matches",
	(await h1.innerText()).replace(/\s+/g, " ").trim() ===
		"Book your perfect stay instantly and hassle-free",
);
check(
	"H1: Instrument Serif, 96px on desktop, line-height 1.1, white",
	await h1.evaluate((el) => {
		const s = getComputedStyle(el);
		return (
			s.fontFamily.includes("Instrument Serif") &&
			s.fontSize === "96px" &&
			Math.abs(parseFloat(s.lineHeight) - 96 * 1.1) < 1 &&
			s.color === "rgb(255, 255, 255)"
		);
	}),
);
check(
	'"and" is italicized with spacing',
	await desktop.evaluate(() => {
		const em = document.querySelector("h1 em");
		if (em?.textContent !== "and") return false;
		const s = getComputedStyle(em);
		return (
			s.fontStyle === "italic" &&
			parseFloat(s.marginLeft) > 0 &&
			parseFloat(s.marginRight) > 0
		);
	}),
);

// Subtext
const sub = desktop.locator("section p");
check(
	"Subtext: Inter 18px normal, white/70, max-w 662px",
	await sub.evaluate((el) => {
		const s = getComputedStyle(el);
		return (
			s.fontFamily.includes("Inter") &&
			s.fontSize === "18px" &&
			s.fontWeight === "400" &&
			s.color === "rgba(255, 255, 255, 0.7)" &&
			s.maxWidth === "662px"
		);
	}),
);
check(
	"Subtext copy matches",
	(await sub.innerText()).replace(/\s+/g, " ").trim() ===
		"Discover handpicked hotels, resorts, and stays across your favorite destinations. Enjoy exclusive deals, fast booking, and 24/7 support.",
);

// CTAs
const demo = desktop.locator("section button", { hasText: "Book a Free Demo" });
const startNow = desktop.locator("section button", {
	hasText: "Get Started Now",
});
check(
	"CTA 1: #7b39fc, 10px radius, Cabin 16px medium, white",
	await demo.evaluate((b) => {
		const s = getComputedStyle(b);
		return (
			s.backgroundColor === "rgb(123, 57, 252)" &&
			s.borderRadius === "10px" &&
			s.fontFamily.includes("Cabin") &&
			s.fontSize === "16px" &&
			s.fontWeight === "500" &&
			s.color === "rgb(255, 255, 255)"
		);
	}),
);
check(
	"CTA 2: #2b2344, 10px radius, Cabin 16px medium, #f6f7f9",
	await startNow.evaluate((b) => {
		const s = getComputedStyle(b);
		return (
			s.backgroundColor === "rgb(43, 35, 68)" &&
			s.borderRadius === "10px" &&
			s.fontFamily.includes("Cabin") &&
			s.fontSize === "16px" &&
			s.fontWeight === "500" &&
			s.color === "rgb(246, 247, 249)"
		);
	}),
);
check(
	"CTA 1 lightens on hover",
	await demo.evaluate(async (b) => {
		const before = getComputedStyle(b).backgroundColor;
		b.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		return before === "rgb(123, 57, 252)";
	}),
);
await demo.hover();
await desktop.waitForTimeout(350);
check(
	"CTA 1 hover bg is lighter (#8d53ff)",
	(await demo.evaluate((b) => getComputedStyle(b).backgroundColor)) ===
		"rgb(141, 83, 255)",
);

// Hero container alignment
check(
	"Hero content: centered column, text-center, z-10, mt-32",
	await desktop.locator("section").evaluate((el) => {
		const s = getComputedStyle(el);
		return (
			s.display === "flex" &&
			s.flexDirection === "column" &&
			s.alignItems === "center" &&
			s.textAlign === "center" &&
			s.zIndex === "10" &&
			s.marginTop === "128px"
		);
	}),
);

// ---------- Mobile (390x844) ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileErrors = [];
mobile.on("pageerror", (err) => mobileErrors.push(err.message));
await mobile.goto(BASE_URL, { waitUntil: "load" });
await mobile.waitForTimeout(1200);

check(
	"Mobile: no uncaught page errors",
	mobileErrors.length === 0,
	mobileErrors.join("; "),
);
check(
	"Mobile: desktop nav hidden",
	!(await mobile.locator('header nav[aria-label="Primary"]').isVisible()),
);
check(
	"Mobile: desktop buttons hidden",
	!(await mobile
		.locator("header > div button", { hasText: "Sign In" })
		.isVisible()),
);
const burger = mobile.locator('button[aria-label="Open menu"]');
check(
	"Mobile: hamburger visible + white",
	(await burger.isVisible()) &&
		(await burger.evaluate(
			(b) => getComputedStyle(b).color === "rgb(255, 255, 255)",
		)),
);
check(
	"Mobile: H1 is text-5xl (48px)",
	(await mobile
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontSize)) === "48px",
);

// Open the overlay menu
await burger.click();
await mobile.waitForTimeout(600);
const overlay = mobile.locator("header div.fixed.inset-0");
check(
	"Mobile: overlay opens, full-screen black",
	await overlay.evaluate((el) => {
		const s = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		return (
			s.backgroundColor === "rgb(0, 0, 0)" &&
			r.width === window.innerWidth &&
			r.height === window.innerHeight
		);
	}),
);
for (const link of ["Home", "Services", "Reviews", "Contact us"]) {
	check(
		`Mobile overlay link "${link}"`,
		await mobile
			.locator(`nav[aria-label="Mobile"] a:has-text("${link}")`)
			.isVisible(),
	);
}
check(
	"Mobile overlay: body scroll locked",
	await mobile.evaluate(() => document.body.style.overflow === "hidden"),
);
await mobile.locator('button[aria-label="Close menu"]').click();
await mobile.waitForTimeout(300);
check("Mobile: overlay closes", (await overlay.count()) === 0);
check(
	"Mobile: body scroll restored",
	await mobile.evaluate(() => document.body.style.overflow === ""),
);

await browser.close();

console.log(
	failures === 0
		? "\nAll checks passed ✅"
		: `\n${failures} check(s) failed ❌`,
);
process.exit(failures === 0 ? 0 : 1);
