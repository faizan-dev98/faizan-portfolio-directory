/**
 * CLI verification for the Ironclad password-manager hero.
 * Run: node verify.mjs (expects `vite preview` serving dist on port 4173)
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

// ---------- Desktop ----------
const desktop = await browser.newPage({
	viewport: { width: 1440, height: 900 },
});
const pageErrors = [];
desktop.on("pageerror", (err) => pageErrors.push(err.message));
await desktop.goto(BASE_URL, { waitUntil: "networkidle" });

check(
	"No uncaught page errors",
	pageErrors.length === 0,
	pageErrors.join("; "),
);

// Background video
const video = desktop.locator("video");
check("Video element present", (await video.count()) === 1);
check(
	"Video src is the CloudFront mp4",
	(await video.getAttribute("src"))?.includes("d8j0ntlcm91z4.cloudfront.net"),
);
check(
	"Video autoplay/muted/loop/playsinline",
	await video.evaluate((v) => v.autoplay && v.muted && v.loop && v.playsInline),
);
check(
	"Video classes",
	(await video.getAttribute("class")) ===
		"absolute inset-0 z-0 w-full h-full object-cover",
);

// Logo
const logo = desktop.locator('header svg[viewBox="0 0 256 256"]');
check(
	"Logo SVG 32x32 viewBox 0 0 256 256",
	(await logo.count()) === 1 &&
		(await logo.getAttribute("width")) === "32" &&
		(await logo.getAttribute("fill")) === "#192837",
);

// Navbar links
for (const link of ["Vault", "Plans", "Install", "News", "Help"]) {
	check(
		`Nav link "${link}" visible`,
		await desktop.locator(`header nav a:has-text("${link}")`).isVisible(),
	);
}
const startBtn = desktop.locator("header button", {
	hasText: "Start For Free",
});
const signBtn = desktop.locator("header button", { hasText: "Sign In" });
check('"Start For Free" pill visible', await startBtn.isVisible());
check(
	'"Start For Free" background #7342E2',
	(await startBtn.evaluate((b) => getComputedStyle(b).backgroundColor)) ===
		"rgb(115, 66, 226)",
);
check('"Sign In" pill visible', await signBtn.isVisible());
check(
	'"Sign In" background #F2F2EE',
	(await signBtn.evaluate((b) => getComputedStyle(b).backgroundColor)) ===
		"rgb(242, 242, 238)",
);
check(
	"Hamburger hidden on desktop",
	!(await desktop.locator('header button[aria-label="Open menu"]').isVisible()),
);

// Hero content
const h1 = desktop.locator("h1");
check(
	"H1 text",
	(await h1.innerText()).replace(/\s+/g, " ").includes("Lock") &&
		(await h1.innerText()).includes("Ironclad Security"),
);
check(
	"H1 uses heading font var",
	(await h1.evaluate((el) => el.style.fontFamily)).includes("--font-heading"),
);
check(
	"H1 contains 3 inline icons (Zap, LockKeyhole, Fingerprint)",
	(await h1.locator("svg").count()) === 3,
);
check(
	"H1 color #192837",
	(await h1.evaluate((el) => getComputedStyle(el).color)) === "rgb(25, 40, 55)",
);

const subtext = desktop.locator("p", { hasText: "Zero stress, total control" });
check("Subtext copy present", await subtext.isVisible());
check(
	"Subtext resting opacity 0.8",
	(await subtext
		.locator("span")
		.evaluate((el) => getComputedStyle(el).opacity)) === "0.8",
);

const cta = desktop.locator("button", { hasText: "Get It Free" });
check('CTA "Get It Free" visible', await cta.isVisible());
check(
	"CTA pill radius 50px",
	(await cta.evaluate((b) => getComputedStyle(b).borderRadius)) === "50px",
);
check(
	"CTA background #7342E2",
	(await cta.evaluate((b) => getComputedStyle(b).backgroundColor)) ===
		"rgb(115, 66, 226)",
);
check(
	"CTA min-width 210px",
	(await cta.evaluate((b) => getComputedStyle(b).minWidth)) === "210px",
);
check(
	"CTA has ArrowRightCircle icon",
	(await cta.locator("svg").count()) === 1,
);

// Framer Motion entrance settled (opacity animated to 1)
await desktop.waitForTimeout(1500);
check(
	"H1 animated to opacity 1",
	(await h1.evaluate((el) => getComputedStyle(el).opacity)) === "1",
);
check(
	"CTA animated to opacity 1",
	(await cta.evaluate((el) => getComputedStyle(el).opacity)) === "1",
);

// CSS variables on :root
const vars = await desktop.evaluate(() => {
	const s = getComputedStyle(document.documentElement);
	return {
		heading: s.getPropertyValue("--font-heading").trim(),
		body: s.getPropertyValue("--font-body").trim(),
		text: s.getPropertyValue("--color-text").trim(),
		accent: s.getPropertyValue("--color-accent").trim(),
		login: s.getPropertyValue("--color-login-bg").trim(),
	};
});
check(
	"--font-heading var",
	vars.heading.includes("Helvetica Now Display Bold"),
);
check("--font-body var", vars.body.includes("Inter"));
check("--color-text #192837", vars.text === "#192837");
check("--color-accent #7342E2", vars.accent === "#7342E2");
check("--color-login-bg #F2F2EE", vars.login === "#F2F2EE");

// Font stylesheets wired up
const html = await desktop.content();
check(
	"Helvetica Now Display Bold stylesheet linked",
	html.includes("db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901"),
);
const cssHasInter = await desktop.evaluate(async () => {
	const sheets = [
		...document.querySelectorAll('link[rel="stylesheet"], style'),
	];
	return sheets.length > 0;
});
check("Stylesheets present", cssHasInter);

await desktop.screenshot({ path: "screenshots/desktop.png", fullPage: true });

// ---------- Mobile ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE_URL, { waitUntil: "networkidle" });

check(
	"Desktop nav hidden on mobile",
	!(await mobile.locator("header nav").isVisible()),
);
const hamburger = mobile.locator('header button[aria-label="Open menu"]');
check("Hamburger visible on mobile", await hamburger.isVisible());

await hamburger.click();
await mobile.waitForTimeout(700); // let the 0.45s slide-in finish

const sheet = mobile.locator("aside");
check("Mobile sheet visible after tap", await sheet.isVisible());
check(
	"Sheet background #CFC8C5",
	(await sheet.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
		"rgb(207, 200, 197)",
);
check(
	"Sheet width min(88vw, 360px) → 343.2px at 390vw",
	Math.abs(
		(await sheet.evaluate((el) => el.getBoundingClientRect().width)) - 343.2,
	) < 1,
);
check(
	"Sheet fully slid in (x=0)",
	(await sheet.evaluate((el) => el.getBoundingClientRect().right)) === 390,
);
for (const link of ["Vault", "Plans", "Install", "News", "Help"]) {
	check(
		`Sheet link "${link}" visible`,
		await sheet.locator(`a:has-text("${link}")`).isVisible(),
	);
}
check(
	"Sheet has Start For Free + Sign In CTAs",
	(await sheet.locator("button", { hasText: "Start For Free" }).count()) ===
		1 && (await sheet.locator("button", { hasText: "Sign In" }).count()) === 1,
);
check(
	"Hamburger toggled to X (close state)",
	(await mobile.locator('header button[aria-label="Close menu"]').count()) ===
		1,
);

await mobile.screenshot({ path: "screenshots/mobile-menu-open.png" });

// Backdrop click dismisses
await mobile.mouse.click(20, 400);
await mobile.waitForTimeout(600); // 0.35s exit
check(
	"Backdrop click dismisses sheet",
	(await mobile.locator("aside").count()) === 0,
);

await mobile.screenshot({ path: "screenshots/mobile.png" });

await browser.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
