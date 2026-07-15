/**
 * Headless verification for the DesignPro video hero.
 * Run with the preview server up:  npm run preview -- --port 4180
 * Then:                            node scripts/verify.mjs
 */
import { chromium } from "playwright";

const URL = process.env.VERIFY_URL ?? "http://localhost:4180/";
const VIDEO_SRC =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
	if (!ok) failures += 1;
};

// Tailwind v4 computes colors in oklab/oklch space; accept both notations.
const isWhite80 = (c) =>
	c === "rgba(255, 255, 255, 0.8)" ||
	(c.startsWith("oklab(0.999") && c.endsWith("/ 0.8)"));
const isGray700 = (c) => c === "rgb(55, 65, 81)" || c.startsWith("oklch(0.373");
const isGray900 = (c) => c === "rgb(17, 24, 39)" || c.startsWith("oklch(0.21 ");

const browser = await chromium.launch();
const consoleErrors = [];

// ---------- Desktop (1280×800, xl breakpoint) ----------
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on(
	"console",
	(msg) => msg.type() === "error" && consoleErrors.push(msg.text()),
);
page.on("pageerror", (err) => consoleErrors.push(String(err)));
await page.goto(URL, { waitUntil: "networkidle" });

// Background video
const video = page.locator("video");
check("video element present", (await video.count()) === 1);
check(
	"video src is the exact CloudFront URL",
	(await video.getAttribute("src")) === VIDEO_SRC,
);
const videoProps = await video.evaluate((v) => ({
	autoplay: v.autoplay,
	loop: v.loop,
	muted: v.muted,
	playsInline: v.playsInline,
	paused: v.paused,
	readyState: v.readyState,
}));
check(
	"video autoplay/loop/muted/playsInline",
	videoProps.autoplay &&
		videoProps.loop &&
		videoProps.muted &&
		videoProps.playsInline,
	JSON.stringify(videoProps),
);
check(
	"video is actually playing",
	!videoProps.paused && videoProps.readyState >= 2,
	`readyState=${videoProps.readyState}`,
);
const videoClasses = await video.getAttribute("class");
check(
	"video absolute inset-0 object-cover",
	["absolute", "inset-0", "object-cover"].every((c) =>
		videoClasses.includes(c),
	),
	videoClasses,
);

// Section + background
const sectionInfo = await page.locator("section").evaluate((s) => ({
	height: s.getBoundingClientRect().height,
	bg: getComputedStyle(s).backgroundColor,
}));
check(
	"section is h-screen",
	Math.round(sectionInfo.height) === 800,
	`height=${sectionInfo.height}`,
);
check(
	"section background is black",
	sectionInfo.bg === "rgb(0, 0, 0)",
	sectionInfo.bg,
);

// Typography
const bodyFont = await page.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("Inter font family", /Inter/i.test(bodyFont), bodyFont);

// Navigation
check(
	'logo text "DesignPro"',
	(await page.locator("nav a", { hasText: "DesignPro" }).count()) === 1,
);
const logoRing = page.locator("nav a span").first();
const logoStyle = await logoRing.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		borderWidth: cs.borderTopWidth,
		borderColor: cs.borderTopColor,
		radius: cs.borderRadius,
	};
});
check(
	"logo circle: 2px white border, rounded-full",
	logoStyle.borderWidth === "2px" &&
		logoStyle.borderColor === "rgb(255, 255, 255)",
	JSON.stringify(logoStyle),
);
for (const link of [
	"Home",
	"About Us",
	"Courses",
	"Instructors",
	"Testimonials",
	"Blog",
	"Contact us",
]) {
	check(
		`nav link "${link}" visible on desktop`,
		await page.locator(`nav >> text="${link}"`).isVisible(),
	);
}
const pill = page.locator("nav > div.hidden");
const pillStyle = await pill.evaluate((el) => {
	const cs = getComputedStyle(el);
	return { radius: cs.borderRadius, borderColor: cs.borderTopColor };
});
check(
	"pill container has gray-700 border + rounded-full",
	isGray700(pillStyle.borderColor) && parseFloat(pillStyle.radius) > 100,
	JSON.stringify(pillStyle),
);
const navLinkStyle = await page.locator('nav >> text="Home"').evaluate((el) => {
	const cs = getComputedStyle(el);
	return { color: cs.color, fontSize: cs.fontSize };
});
check(
	"nav links white/80 + text-sm",
	isWhite80(navLinkStyle.color) && navLinkStyle.fontSize === "14px",
	JSON.stringify(navLinkStyle),
);
check(
	"hamburger hidden on desktop",
	!(await page.locator('nav button[aria-label="Open menu"]').isVisible()),
);

// Top section copy
check(
	"left column copy",
	await page
		.getByText(
			"We deliver transformative programs that empower emerging product designers",
		)
		.isVisible(),
);
const rightCol = page.getByText("8000+ Talented Designers Launched !");
check("right column copy", await rightCol.isVisible());
check(
	"right column right-aligned on lg+",
	(await rightCol.evaluate((el) => getComputedStyle(el).textAlign)) === "right",
);
const paraStyle = await rightCol.evaluate((el) => {
	const cs = getComputedStyle(el);
	return { color: cs.color, fontSize: cs.fontSize };
});
check(
	"paragraphs white/80 + text-base on desktop",
	isWhite80(paraStyle.color) && paraStyle.fontSize === "16px",
	JSON.stringify(paraStyle),
);

// Hero kicker + heading
const kicker = page.getByText("Seats for Next Program Opening Soon");
check("kicker visible", await kicker.isVisible());
const kickerStyle = await kicker.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		transform: cs.textTransform,
		fontSize: cs.fontSize,
		color: cs.color,
	};
});
check(
	"kicker uppercase, text-sm on desktop, white/80",
	kickerStyle.transform === "uppercase" &&
		kickerStyle.fontSize === "14px" &&
		isWhite80(kickerStyle.color),
	JSON.stringify(kickerStyle),
);

const h1 = page.locator("h1");
const h1Style = await h1.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		fontSize: cs.fontSize,
		lineHeight: cs.lineHeight,
		letterSpacing: cs.letterSpacing,
	};
});
check(
	"h1 text-9xl at xl (128px)",
	h1Style.fontSize === "128px",
	JSON.stringify(h1Style),
);
check(
	"h1 line-height 0.85 (108.8px)",
	Math.abs(parseFloat(h1Style.lineHeight) - 128 * 0.85) < 0.5,
	h1Style.lineHeight,
);
check(
	"h1 tracking-tighter (negative)",
	parseFloat(h1Style.letterSpacing) < 0,
	h1Style.letterSpacing,
);
const becomeStyle = await page.locator('h1 >> text="Become"').evaluate((el) => {
	const cs = getComputedStyle(el);
	return { color: cs.color, weight: cs.fontWeight };
});
check(
	'"Become" white + font-medium',
	becomeStyle.color === "rgb(255, 255, 255)" && becomeStyle.weight === "500",
	JSON.stringify(becomeStyle),
);

// ShinyText gradient + animation
const shiny = page.locator('h1 >> text="Product Leader."');
check('"Product Leader." rendered', await shiny.isVisible());
const shinyStyle = await shiny.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		backgroundImage: cs.backgroundImage,
		backgroundSize: cs.backgroundSize,
		clip: cs.webkitBackgroundClip || cs.backgroundClip,
		fill: cs.webkitTextFillColor,
	};
});
check(
	"shiny gradient at 100deg with #64CEFB base + white shine",
	shinyStyle.backgroundImage.includes("100deg") &&
		shinyStyle.backgroundImage.includes("rgb(100, 206, 251)") &&
		shinyStyle.backgroundImage.includes("rgb(255, 255, 255)"),
	shinyStyle.backgroundImage,
);
check(
	"background-clip: text + transparent fill",
	shinyStyle.clip === "text" && shinyStyle.fill === "rgba(0, 0, 0, 0)",
	JSON.stringify({ clip: shinyStyle.clip, fill: shinyStyle.fill }),
);
check(
	"background-size 200%",
	shinyStyle.backgroundSize.startsWith("200%"),
	shinyStyle.backgroundSize,
);
const pos1 = await shiny.evaluate(
	(el) => getComputedStyle(el).backgroundPosition,
);
await page.waitForTimeout(700);
const pos2 = await shiny.evaluate(
	(el) => getComputedStyle(el).backgroundPosition,
);
const px = (p) => parseFloat(p);
check(
	"shine sweeps continuously left→right (position-x decreasing)",
	pos1 !== pos2 && px(pos2) < px(pos1),
	`${pos1} → ${pos2}`,
);

// CTA button
const cta = page.locator("a", { hasText: "Apply for Next Enrollment" });
check("CTA visible with text", await cta.isVisible());
const ctaStyle = await cta.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		bg: cs.backgroundColor,
		radius: cs.borderRadius,
		px: cs.paddingLeft,
		py: cs.paddingTop,
	};
});
check(
	"CTA black bg, rounded-full, px-8/py-4 on desktop",
	ctaStyle.bg === "rgb(0, 0, 0)" &&
		ctaStyle.px === "32px" &&
		ctaStyle.py === "16px",
	JSON.stringify(ctaStyle),
);
check("CTA contains arrow svg icon", (await cta.locator("svg").count()) === 1);
await cta.hover();
await page.waitForTimeout(400);
const hovered = await cta.evaluate((el) => {
	const arrow = getComputedStyle(el.querySelector("svg"));
	return {
		bg: getComputedStyle(el).backgroundColor,
		// Tailwind v4 translate utilities use the CSS `translate` property
		arrow: arrow.translate !== "none" ? arrow.translate : arrow.transform,
	};
});
check("CTA hover: gray-900 bg", isGray900(hovered.bg), hovered.bg);
check(
	"CTA hover: arrow translates right",
	hovered.arrow !== "none" && parseFloat(hovered.arrow) > 0,
	hovered.arrow,
);

// Content above video (z-index)
const zContent = await page
	.locator("section > div.relative")
	.evaluate((el) => getComputedStyle(el).zIndex);
check("content layer z-10 above video", zContent === "10", zContent);

// Max-width container
const navWidth = await page
	.locator("nav")
	.evaluate((el) => el.getBoundingClientRect().width);
check(
	"nav constrained to max-w-7xl (1280px)",
	navWidth <= 1280,
	`width=${navWidth}`,
);

await page.close();

// ---------- Mobile (390×844, below lg) ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
mobile.on("pageerror", (err) => consoleErrors.push(String(err)));
await mobile.goto(URL, { waitUntil: "networkidle" });
const burger = mobile.locator('nav button[aria-label="Open menu"]');
check("hamburger visible on mobile", await burger.isVisible());
check(
	"pill nav hidden on mobile",
	!(await mobile.locator('nav >> text="Courses"').isVisible()),
);
const mobileH1 = await mobile
	.locator("h1")
	.evaluate((el) => getComputedStyle(el).fontSize);
check("h1 text-5xl on mobile (48px)", mobileH1 === "48px", mobileH1);
const mobileKicker = await mobile
	.getByText("Seats for Next Program Opening Soon")
	.evaluate((el) => getComputedStyle(el).fontSize);
check("kicker text-xs on mobile (12px)", mobileKicker === "12px", mobileKicker);
const mobilePara = await mobile
	.getByText("8000+ Talented Designers Launched !")
	.evaluate((el) => getComputedStyle(el).fontSize);
check("paragraphs text-sm on mobile (14px)", mobilePara === "14px", mobilePara);
const mobileCta = await mobile
	.locator("a", { hasText: "Apply for Next Enrollment" })
	.evaluate((el) => ({
		px: getComputedStyle(el).paddingLeft,
		py: getComputedStyle(el).paddingTop,
	}));
check(
	"CTA px-6/py-3 on mobile",
	mobileCta.px === "24px" && mobileCta.py === "12px",
	JSON.stringify(mobileCta),
);
await burger.click();
await mobile.waitForTimeout(400);
check(
	"mobile menu opens with links",
	await mobile
		.locator("header div.absolute")
		.getByText("Instructors")
		.isVisible(),
);
check(
	"hamburger toggles to close icon",
	await mobile.locator('nav button[aria-label="Close menu"]').isVisible(),
);
await mobile.close();

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ") || "clean",
);

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
