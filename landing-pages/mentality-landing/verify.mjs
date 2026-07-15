import { chromium } from "playwright-core";

const BASE = "http://localhost:4173";
let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures++;
};

const browser = await chromium.launch({ channel: "chrome", headless: true });

// ---------- Desktop ----------
const desktop = await browser.newPage({
	viewport: { width: 1440, height: 900 },
});
const errors = [];
desktop.on("pageerror", (e) => errors.push(String(e)));
desktop.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await desktop.goto(BASE, { waitUntil: "networkidle" });
await desktop.waitForTimeout(1500); // let entrance animations settle

check(
	"no console/page errors",
	errors.length === 0,
	errors.join(" | ").slice(0, 200),
);

const bodyBg = await desktop.evaluate(
	() => getComputedStyle(document.body).backgroundColor,
);
check("body background is #EDEEF5", bodyBg === "rgb(237, 238, 245)", bodyBg);

const h1 = desktop.locator("h1");
const h1Text = (await h1.innerText()).replace(/\s+/g, " ").trim();
check(
	"h1 exact copy",
	h1Text ===
		"Remix: Mentality offers information and resources to help you manage your mental wellbeing.",
	h1Text,
);
const h1Style = await h1.evaluate((el) => {
	const s = getComputedStyle(el);
	return { font: s.fontFamily, opacity: s.opacity };
});
check(
	"h1 uses Outfit display font",
	h1Style.font.includes("Outfit"),
	h1Style.font,
);
check(
	"h1 fully faded in (motion ran)",
	parseFloat(h1Style.opacity) > 0.99,
	h1Style.opacity,
);

const bodyFont = await desktop.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("body uses Inter", bodyFont.includes("Inter"), bodyFont);

const video = desktop.locator("video");
check("video element present", (await video.count()) === 1);
const videoInfo = await video.evaluate((v) => ({
	src: v.currentSrc || v.getAttribute("src"),
	autoplay: v.autoplay,
	loop: v.loop,
	muted: v.muted,
	playsInline: v.playsInline,
	paused: v.paused,
	readyState: v.readyState,
}));
check(
	"video src is exact CloudFront URL",
	(videoInfo.src || "").includes(
		"hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4",
	),
	videoInfo.src,
);
check(
	"video autoplay/loop/muted/playsInline",
	videoInfo.autoplay &&
		videoInfo.loop &&
		videoInfo.muted &&
		videoInfo.playsInline,
);
check(
	"video is playing",
	!videoInfo.paused && videoInfo.readyState >= 2,
	`paused=${videoInfo.paused} readyState=${videoInfo.readyState}`,
);

const header = desktop.locator("header");
const headerPos = await header.evaluate((el) => getComputedStyle(el).position);
check("navbar is fixed", headerPos === "fixed", headerPos);

for (const link of [
	"service",
	"patient resources",
	"about us",
	"education center",
	"find help",
]) {
	check(
		`desktop nav link visible: ${link}`,
		await desktop.getByText(link, { exact: true }).first().isVisible(),
	);
}
check(
	"get started button visible",
	await desktop
		.getByText(/get started/)
		.first()
		.isVisible(),
);
check(
	"brand mėntality visible",
	await desktop.getByText("mėntality").isVisible(),
);

const input = desktop.locator('input[placeholder="Ask me anything..."]');
check("search input with placeholder", await input.isVisible());
const inputBg = await input.evaluate(
	(el) => getComputedStyle(el).backgroundColor,
);
check("search input transparent bg", inputBg === "rgba(0, 0, 0, 0)", inputBg);

check(
	"language pill: pl",
	await desktop.getByRole("button", { name: "pl" }).isVisible(),
);
check(
	"language pill: en",
	await desktop.getByRole("button", { name: "en" }).isVisible(),
);
check(
	"anchor: 2024",
	await desktop.getByText("2024", { exact: true }).isVisible(),
);
check(
	"anchor: mental health tools",
	await desktop.getByText("mental health tools").isVisible(),
);

// language toggle interactivity
await desktop.getByRole("button", { name: "pl" }).click();
const plPressed = await desktop
	.getByRole("button", { name: "pl" })
	.getAttribute("aria-pressed");
check(
	"language toggle switches to pl",
	plPressed === "true",
	`aria-pressed=${plPressed}`,
);

const sel = await desktop.evaluate(() => {
	const el = document.querySelector("h1 span");
	return getComputedStyle(el, "::selection").backgroundColor || "n/a";
});
console.log(`info  selection bg: ${sel}`);

const hamburgerHiddenDesktop = await desktop
	.locator('button[aria-controls="mobile-drawer"]')
	.isHidden();
check("hamburger hidden on desktop", hamburgerHiddenDesktop);

// section geometry: video bottom should equal section bottom (no gap below video)
const geo = await desktop.evaluate(() => {
	const section = document.querySelector("section").getBoundingClientRect();
	const wrap = document
		.querySelector("video")
		.parentElement.getBoundingClientRect();
	return {
		sectionBottom: section.bottom,
		videoBottom: wrap.bottom,
		sectionH: section.height,
		vh: window.innerHeight,
	};
});
check(
	"video bottom flush with hero bottom (no artificial gap)",
	Math.abs(geo.sectionBottom - geo.videoBottom) < 1,
	`section=${geo.sectionBottom.toFixed(1)} video=${geo.videoBottom.toFixed(1)}`,
);
check(
	"hero is 140vh on desktop",
	Math.abs(geo.sectionH - geo.vh * 1.4) < 2,
	`h=${geo.sectionH} vh=${geo.vh}`,
);

await desktop.screenshot({ path: "shots/desktop.png" });

// ---------- Mobile ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(1200);

check(
	"mobile: center links hidden",
	await mobile.getByText("education center").first().isHidden(),
);
const burger = mobile.locator('button[aria-controls="mobile-drawer"]');
check("mobile: hamburger visible", await burger.isVisible());
await burger.click();
await mobile.waitForTimeout(700);
check(
	"mobile: drawer open with links",
	await mobile
		.locator("#mobile-drawer")
		.getByText("patient resources")
		.isVisible(),
);
check(
	"mobile: drawer get started",
	await mobile
		.locator("#mobile-drawer")
		.getByText(/get started/)
		.isVisible(),
);
await mobile.screenshot({ path: "shots/mobile-drawer.png" });
await burger.click();
await mobile.waitForTimeout(700);
check(
	"mobile: drawer closes (AnimatePresence exit)",
	(await mobile.locator("#mobile-drawer").count()) === 0,
);

const mobGeo = await mobile.evaluate(() => {
	const section = document.querySelector("section").getBoundingClientRect();
	return { h: section.height, vh: window.innerHeight };
});
check(
	"hero is 110vh on mobile",
	Math.abs(mobGeo.h - mobGeo.vh * 1.1) < 2,
	`h=${mobGeo.h} vh=${mobGeo.vh}`,
);
await mobile.screenshot({ path: "shots/mobile.png" });

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
