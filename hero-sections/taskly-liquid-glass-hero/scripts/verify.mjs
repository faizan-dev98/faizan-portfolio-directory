/**
 * CLI verification for the Taskly liquid-glass hero.
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

function warn(name, condition, detail = "") {
	const ok = Boolean(condition);
	console.log(
		`${ok ? "PASS" : "WARN"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	return ok;
}

const browser = await chromium.launch();

// ---------- Desktop (1600px — the spec's max-width) ----------
const desktop = await browser.newPage({
	viewport: { width: 1600, height: 1000 },
});
const pageErrors = [];
desktop.on("pageerror", (err) => pageErrors.push(err.message));
await desktop.goto(BASE_URL, { waitUntil: "load" });
await desktop.waitForTimeout(2500); // entrance animations + video fetch

check(
	"No uncaught page errors",
	pageErrors.length === 0,
	pageErrors.join("; "),
);

// Shell + glow
const shell = desktop.locator("[data-shell]");
check(
	"Main container max-width 1600px",
	(await shell.evaluate((el) => getComputedStyle(el).maxWidth)) === "1600px",
);
check(
	"Glow layer has 3 ellipses",
	(await desktop.locator("[data-glow]").count()) === 3,
);
check(
	"Glow ellipse #60B1FF",
	(await desktop
		.locator('[data-glow="60B1FF"]')
		.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
		"rgb(96, 177, 255)",
);
check(
	"Glow ellipse #319AFF",
	(await desktop
		.locator('[data-glow="319AFF"]')
		.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
		"rgb(49, 154, 255)",
);
check(
	"Body is pure white",
	(await desktop.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	)) === "rgb(255, 255, 255)",
);
check(
	"Font smoothing antialiased",
	(await desktop.evaluate(
		() => getComputedStyle(document.body).webkitFontSmoothing,
	)) === "antialiased",
);

// Navbar — strong liquid glass
const nav = desktop.locator("nav");
const navStyle = await nav.evaluate((el) => {
	const s = getComputedStyle(el);
	return {
		position: s.position,
		top: s.top,
		radius: s.borderRadius,
		blur: s.backdropFilter,
		bg: s.backgroundColor,
		borderColor: s.borderTopColor,
		borderWidth: s.borderTopWidth,
		shadow: s.boxShadow,
	};
});
check("Nav position sticky", navStyle.position === "sticky", navStyle.position);
check("Nav top 30px", navStyle.top === "30px", navStyle.top);
check("Nav radius 16px", navStyle.radius === "16px", navStyle.radius);
check("Nav backdrop-blur 50px", navStyle.blur === "blur(50px)", navStyle.blur);
check(
	"Nav bg rgba(255,255,255,0.3)",
	navStyle.bg === "rgba(255, 255, 255, 0.3)",
	navStyle.bg,
);
check(
	"Nav stroke 1px rgba(0,0,0,0.1)",
	navStyle.borderWidth === "1px" &&
		navStyle.borderColor === "rgba(0, 0, 0, 0.1)",
	`${navStyle.borderWidth} / ${navStyle.borderColor}`,
);
check(
	"Nav inner highlight inset rgba(255,255,255,0.25)",
	navStyle.shadow.includes("rgba(255, 255, 255, 0.25)") &&
		navStyle.shadow.includes("inset"),
	navStyle.shadow,
);
const navBox = await nav.boundingBox();
check(
	"Nav is centered + w-fit",
	Math.abs(navBox.x + navBox.width / 2 - 800) < 3 && navBox.width < 900,
	`center=${navBox.x + navBox.width / 2}, w=${navBox.width}`,
);

const brand = desktop.locator("nav a span", { hasText: "Taskly" });
check(
	'Brand "Taskly" in Fustat',
	(await brand.evaluate((el) => getComputedStyle(el).fontFamily)).includes(
		"Fustat",
	),
);
for (const link of ["Home", "Features", "Company", "Pricing"]) {
	check(
		`Nav link "${link}" visible`,
		await desktop.locator(`nav a:has-text("${link}")`).isVisible(),
	);
}
const signup = desktop.locator("nav button", { hasText: "SignUp" });
check(
	"Glassy SignUp button + arrow icon",
	(await signup.isVisible()) && (await signup.locator("svg").count()) === 1,
);

// Social proof badge
const badge = desktop.locator("[data-badge]");
check(
	'Badge copy "Rated 4.9/5 by 2700+ customers"',
	(await badge.innerText())
		.replace(/\s+/g, " ")
		.includes("Rated 4.9/5 by 2700+ customers"),
);
check("Badge has 5 stars", (await badge.locator("[data-star]").count()) === 5);
check(
	"Stars are #FF801E",
	(await badge
		.locator("[data-star]")
		.first()
		.evaluate((el) => getComputedStyle(el).fill)) === "rgb(255, 128, 30)",
);

// Headline
const h1 = desktop.locator("h1");
const h1Style = await h1.evaluate((el) => {
	const s = getComputedStyle(el);
	return {
		size: s.fontSize,
		lh: s.lineHeight,
		ls: s.letterSpacing,
		family: s.fontFamily,
		weight: s.fontWeight,
	};
});
check(
	"H1 text",
	(await h1.innerText()).replace(/\s+/g, " ").trim() ===
		"Work smarter, achieve faster",
);
check("H1 75px", h1Style.size === "75px", h1Style.size);
check("H1 line-height 1.05 (78.75px)", h1Style.lh === "78.75px", h1Style.lh);
check("H1 tracking -2px", h1Style.ls === "-2px", h1Style.ls);
check(
	"H1 Fustat Bold",
	h1Style.family.includes("Fustat") && h1Style.weight === "700",
	`${h1Style.family} / ${h1Style.weight}`,
);

// Subheadline
const sub = desktop.locator("[data-subheadline]");
const subStyle = await sub.evaluate((el) => {
	const s = getComputedStyle(el);
	return { size: s.fontSize, ls: s.letterSpacing, family: s.fontFamily };
});
check(
	"Subheadline copy",
	(await sub.innerText())
		.replace(/\s+/g, " ")
		.includes("Effortlessly manage your projects, collaborate with your team"),
);
check(
	"Subheadline 18px Inter, -1px tracking",
	subStyle.size === "18px" &&
		subStyle.ls === "-1px" &&
		subStyle.family.includes("Inter"),
	JSON.stringify(subStyle),
);

// Primary CTA
const cta = desktop.locator("[data-cta]");
const ctaStyle = await cta.evaluate((el) => {
	const s = getComputedStyle(el);
	return {
		bg: s.backgroundColor,
		radius: s.borderRadius,
		blur: s.backdropFilter,
		color: s.color,
		shadow: s.boxShadow,
	};
});
check('CTA "Get Started Now" visible', await cta.isVisible());
check(
	"CTA bg rgba(0,132,255,0.8)",
	ctaStyle.bg === "rgba(0, 132, 255, 0.8)",
	ctaStyle.bg,
);
check("CTA radius 16px", ctaStyle.radius === "16px", ctaStyle.radius);
check("CTA backdrop-blur 2px", ctaStyle.blur === "blur(2px)", ctaStyle.blur);
check(
	"CTA white text",
	ctaStyle.color === "rgb(255, 255, 255)",
	ctaStyle.color,
);
check(
	"CTA inner highlight inset rgba(255,255,255,0.35)",
	ctaStyle.shadow.includes("rgba(255, 255, 255, 0.35)") &&
		ctaStyle.shadow.includes("inset"),
	ctaStyle.shadow,
);
const arrow = cta.locator("[data-cta-arrow]");
check(
	"CTA white circular arrow icon",
	(await arrow.count()) === 1 &&
		(await arrow.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
			"rgb(255, 255, 255)" &&
		(await arrow.evaluate((el) => getComputedStyle(el).borderRadius)) ===
			"9999px" &&
		(await arrow.locator("svg").count()) === 1,
);

// CTA hover → scale 1.02
await cta.hover();
await desktop.waitForTimeout(450);
check(
	"CTA hover scale 1.02",
	(await cta.evaluate((el) => getComputedStyle(el).transform)) ===
		"matrix(1.02, 0, 0, 1.02, 0, 0)",
);
await desktop.mouse.move(0, 0);

// Glassy orb video
const video = desktop.locator("video");
check("Video element present", (await video.count()) === 1);
check(
	"Video src is the future.co orb webm",
	(await video.getAttribute("src")) ===
		"https://future.co/images/homepage/glassy-orb/orb-purple.webm",
);
check(
	"Video autoplay/loop/muted/playsinline",
	await video.evaluate((v) => v.autoplay && v.loop && v.muted && v.playsInline),
);
const videoStyle = await video.evaluate((el) => {
	const s = getComputedStyle(el);
	return { blend: s.mixBlendMode, filter: s.filter, transform: s.transform };
});
check(
	"Video mix-blend-screen",
	videoStyle.blend === "screen",
	videoStyle.blend,
);
check(
	"Video color grade hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1)",
	videoStyle.filter.includes("hue-rotate(-55deg)") &&
		videoStyle.filter.includes("saturate(2.5)") &&
		videoStyle.filter.includes("brightness(1.2)") &&
		videoStyle.filter.includes("contrast(1.1)"),
	videoStyle.filter,
);
check(
	"Video scale-125",
	videoStyle.transform === "matrix(1.25, 0, 0, 1.25, 0, 0)",
	videoStyle.transform,
);
check(
	"Orb energy field (radial stage) present",
	(
		await desktop
			.locator("[data-orb-stage]")
			.evaluate((el) => getComputedStyle(el).backgroundImage)
	).includes("radial-gradient"),
);
warn(
	"Video stream playing (network)",
	await video.evaluate((v) => v.readyState >= 2 && !v.paused),
);

// Entrance animations settled
check(
	"H1 revealed to opacity 1",
	(await h1.evaluate((el) => getComputedStyle(el).opacity)) === "1",
);
check(
	"Badge revealed to opacity 1",
	(await badge.evaluate((el) => getComputedStyle(el).opacity)) === "1",
);

// Trusted-by logos
const trusted = desktop.locator("section", {
	hasText: "Trusted by Top-tier product companies",
});
check("Trusted heading visible", await trusted.locator("p").isVisible());
check(
	"5 grayscale SVG logos",
	(await desktop.locator("[data-logo]").count()) === 5,
);
check(
	"Logo row gap 100px",
	(await desktop
		.locator("[data-logo-row]")
		.evaluate((el) => getComputedStyle(el).columnGap)) === "100px",
);
check(
	"Logos are grayscale (gray-400)",
	(await desktop
		.locator("[data-logo-row]")
		.evaluate((el) => getComputedStyle(el).color)) === "rgb(156, 163, 175)",
);

// Sticky behaviour: scroll and confirm the nav pins 30px from the top
await desktop.evaluate(() => window.scrollTo(0, 400));
await desktop.waitForTimeout(300);
const stuckBox = await nav.boundingBox();
check(
	"Nav sticks at 30px while scrolled",
	Math.abs(stuckBox.y - 30) < 1,
	`y=${stuckBox.y}`,
);
await desktop.evaluate(() => window.scrollTo(0, 0));

await desktop.screenshot({ path: "screenshots/desktop.png", fullPage: true });

// ---------- Mobile (390px) ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE_URL, { waitUntil: "load" });
await mobile.waitForTimeout(2000);

check(
	"No horizontal overflow on mobile",
	(await mobile.evaluate(() => document.documentElement.scrollWidth)) <= 391,
);
check(
	"Nav links hidden on mobile",
	!(await mobile.locator('nav a:has-text("Features")').isVisible()),
);
check(
	"Brand + SignUp still visible on mobile",
	(await mobile.locator("nav span", { hasText: "Taskly" }).isVisible()) &&
		(await mobile.locator("nav button", { hasText: "SignUp" }).isVisible()),
);
const mobileH1 = await mobile
	.locator("h1")
	.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
check(
	"H1 scales down on mobile",
	mobileH1 >= 40 && mobileH1 < 75,
	`${mobileH1}px`,
);
const ctaBox = await mobile.locator("[data-cta]").boundingBox();
const orbBox = await mobile.locator("[data-orb-stage]").boundingBox();
check(
	"Single column: orb stacks below CTA",
	orbBox.y > ctaBox.y + ctaBox.height,
	`orb.y=${orbBox.y}, cta.bottom=${ctaBox.y + ctaBox.height}`,
);
check("Video present on mobile", (await mobile.locator("video").count()) === 1);

await mobile.screenshot({ path: "screenshots/mobile.png", fullPage: true });

await browser.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
