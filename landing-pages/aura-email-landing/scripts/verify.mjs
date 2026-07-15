/* CLI headless-browser verification for the Aura landing page. */
import { chromium } from "playwright-core";

const EXECUTABLE =
	"/Users/pulkit/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const URL = process.env.AURA_URL ?? "http://localhost:4861/";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures++;
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on("console", (msg) => {
	if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // let load animations settle

// --- Hero ---
const h1 = await page.locator("h1").innerText();
check(
	"Hero headline",
	h1.includes("Your email.") && h1.includes("Revitalized"),
	JSON.stringify(h1),
);
const shiny = page.locator("h1 .animate-shiny");
check("Shiny gradient span present", (await shiny.count()) === 1);
const shinyStyle = await shiny.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		clip: cs.webkitBackgroundClip || cs.backgroundClip,
		filter: cs.filter,
		anim: cs.animationName,
		size: cs.backgroundSize,
	};
});
// Browsers normalize the computed value of `background-size: 200% auto` to `200%`.
check(
	"Gradient text clip + noise filter + animation",
	shinyStyle.clip === "text" &&
		shinyStyle.filter.includes("c3-noise") &&
		shinyStyle.anim === "shiny" &&
		["200%", "200% auto"].includes(shinyStyle.size),
	JSON.stringify(shinyStyle),
);
check(
	"Hero paragraph copy",
	(await page
		.getByText("Aura is the premier inbox platform for the current era", {
			exact: false,
		})
		.count()) === 1,
);
check(
	"Intel / Apple Silicon note",
	(await page.getByText("Download for Intel / Apple Silicon").count()) === 1,
);

// --- Background video + guide lines + filters ---
const video = page.locator("video");
check("Background video src", (await video.getAttribute("src")) === VIDEO_URL);
const videoAttrs = await video.evaluate((v) => ({
	autoplay: v.autoplay,
	loop: v.loop,
	muted: v.muted,
	playsInline: v.playsInline,
}));
check(
	"Video autoplay/loop/muted/playsinline",
	Object.values(videoAttrs).every(Boolean),
	JSON.stringify(videoAttrs),
);
check(
	"Two c3-noise filters",
	(await page.locator("filter#c3-noise").count()) === 2,
);
check(
	"Two vertical guide lines",
	(await page.locator("div.fixed.inset-y-0.w-px").count()) === 2,
);

// --- Navbar ---
for (const link of [
	"Solutions",
	"Pricing",
	"Blog",
	"Documentation",
	"Careers",
]) {
	check(
		`Nav link: ${link}`,
		(await page.locator("nav a", { hasText: link }).count()) === 1,
	);
}
check(
	"Navbar Download Aura button",
	(await page.locator("nav button", { hasText: "Download Aura" }).count()) >= 1,
);

// --- macOS menu bar ---
const menuBar = await page.locator(".h-10.bg-black\\/40").innerText();
check(
	"Menu bar items",
	["File", "Edit", "View", "Go", "Window", "Help"].every((m) =>
		menuBar.includes(m),
	),
	JSON.stringify(menuBar.replaceAll("\n", " ")),
);
check("Menu bar clock", menuBar.includes("Wed May 6 1:09 PM"));

// --- Inbox mockup ---
check(
	"Window title: Aura — Inbox",
	(await page.getByText("Aura — Inbox").count()) === 1,
);
check(
	"Compose with Aura button",
	(await page.getByText("Compose with Aura").count()) === 1,
);
for (const label of [
	"Inbox",
	"Starred",
	"Sent",
	"Drafts",
	"Archive",
	"Trash",
]) {
	check(
		`Sidebar item: ${label}`,
		(await page.locator("aside a", { hasText: label }).count()) >= 1,
	);
}
for (const sender of [
	"Linear",
	"Sophia Chen",
	"Figma",
	"Stripe",
	"Vercel",
	"GitHub",
]) {
	check(
		`Message from: ${sender}`,
		(await page.getByText(sender, { exact: true }).count()) >= 1,
	);
}
check(
	"AI summary card",
	(await page.getByText("Summary by Aura").count()) === 1,
);
check(
	"Summary copy",
	(await page
		.getByText("Your team closed 23 issues, merged 14 PRs", { exact: false })
		.count()) === 1,
);
check(
	"Attachment pill",
	(await page.getByText("digest-may-6.pdf").count()) === 1,
);

// --- FeatureTriage ---
check(
	"Triage headline",
	(await page.getByText("Clear your inbox").count()) === 1,
);
check("Triage eyebrow tag", (await page.getByText("AI-native").count()) === 1);
for (const chip of [
	"Auto-categorize",
	"Snooze for later",
	"Silent newsletters",
	"One-tap unsubscribe",
]) {
	check(`Chip: ${chip}`, (await page.getByText(chip).count()) === 1);
}
check(
	"Triage counter",
	(await page.getByText("Today · 42 messages triaged").count()) === 1,
);

// --- LogoCloud + Testimonials ---
check(
	"Logo cloud kicker",
	(await page
		.getByText("Trusted by the world's most thoughtful teams")
		.count()) === 1,
);
for (const co of ["MERCURY", "COHERE", "LUNAR"]) {
	check(
		`Testimonial company: ${co}`,
		(await page.getByText(co, { exact: true }).count()) === 1,
	);
}

// --- Pricing ---
await page.locator(".c3-pricing-section").scrollIntoViewIfNeeded();
check(
	"Watermark lines",
	(await page.locator(".c3-watermark-line-1").innerText()) === "Your email." &&
		(await page.locator(".c3-watermark-line-2").innerText()) === "Revitalized",
);
check("Three pricing cards", (await page.locator(".c3-card").count()) === 3);
check("Pro card class", (await page.locator(".c3-card-pro").count()) === 1);
check("15 checkmark rows", (await page.locator(".c3-check").count()) === 15);
const pricesMonthly = await page.locator(".c3-tier-large").allInnerTexts();
check(
	"Monthly prices",
	JSON.stringify(pricesMonthly) ===
		JSON.stringify(["Free", "$9,99/m", "$19,99/m"]),
	JSON.stringify(pricesMonthly),
);
await page.locator(".c3-toggle").click();
await page.waitForTimeout(400);
const pricesYearly = await page.locator(".c3-tier-large").allInnerTexts();
check(
	"Yearly prices after toggle",
	JSON.stringify(pricesYearly) ===
		JSON.stringify(["Free", "$99,99/y", "$199,99/y"]),
	JSON.stringify(pricesYearly),
);
check(
	"Toggle gains .active",
	await page
		.locator(".c3-toggle")
		.evaluate((el) => el.classList.contains("active")),
);

// --- FinalCTA ---
check(
	"Final CTA headline",
	(await page.getByText("Close the tabs.").count()) === 1 &&
		(await page.getByText("Open your day.").count()) === 1,
);
check(
	"Talk to sales button",
	(await page.getByText("Talk to sales").count()) === 1,
);

// --- Liquid glass + font ---
check(
	"Liquid-glass cards present",
	(await page.locator(".liquid-glass").count()) >= 9,
	`count=${await page.locator(".liquid-glass").count()}`,
);
const bodyFont = await page.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("Inter font applied", bodyFont.startsWith("Inter"), bodyFont);
const bodyBg = await page.evaluate(
	() => getComputedStyle(document.body).backgroundColor,
);
check("Body bg #0c0c0c", bodyBg === "rgb(12, 12, 12)", bodyBg);

// --- Console errors (ignore benign video/media network noise from headless shell) ---
const realErrors = consoleErrors.filter(
	(e) => !e.includes("ERR_") || e.includes("pageerror"),
);
check(
	"No console/page errors",
	realErrors.length === 0,
	realErrors.join(" | ") || "clean",
);

// --- Evidence screenshots ---
await page.screenshot({ path: "/tmp/aura-full.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/aura-mobile.png", fullPage: true });
console.log("Screenshots: /tmp/aura-full.png, /tmp/aura-mobile.png");

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
