/* Headless CLI verification for the ai-builder-dark-hero experiment.
 * Boots `vite preview` against the production build, then checks every
 * prompt requirement it can observe from the DOM and computed styles.
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = 4179;
const URL_BASE = `http://localhost:${PORT}/`;

let failures = 0;
function check(name, ok, detail = "") {
	const status = ok ? "PASS" : "FAIL";
	if (!ok) failures += 1;
	console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const preview = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{
		stdio: "pipe",
	},
);

await new Promise((resolve, reject) => {
	const timer = setTimeout(
		() => reject(new Error("preview server timed out")),
		20000,
	);
	preview.stdout.on("data", (d) => {
		if (d.toString().includes("localhost")) {
			clearTimeout(timer);
			resolve();
		}
	});
	preview.on("exit", () => reject(new Error("preview server exited early")));
});

const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL_BASE, { waitUntil: "networkidle" });
	await page.waitForTimeout(1500); // let entrance animations settle

	check("page title", (await page.title()).includes("Build Faster"));

	// ---- Navbar ----
	const header = page.locator("header");
	const headerClass = await header.getAttribute("class");
	check(
		"navbar fixed + transparent + z-50",
		/fixed/.test(headerClass) &&
			/bg-transparent/.test(headerClass) &&
			/z-50/.test(headerClass),
		headerClass,
	);
	check(
		"sunburst svg icon in navbar",
		(await header.locator("svg circle").count()) === 1 &&
			(await header.locator("svg line").count()) === 12,
	);
	for (const label of [
		"Products",
		"Customer Stories",
		"Resources",
		"Pricing",
		"Book A Demo",
		"Get Started",
	]) {
		check(`nav link "${label}"`, (await header.getByText(label).count()) === 1);
	}
	const getStarted = header.getByText("Get Started");
	const gsStyles = await getStarted.evaluate((el) => {
		const s = getComputedStyle(el);
		return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
	});
	check(
		"Get Started: white pill w/ black text",
		gsStyles.bg === "rgb(255, 255, 255)" && gsStyles.color === "rgb(0, 0, 0)",
		JSON.stringify(gsStyles),
	);

	// ---- Hero copy ----
	const pre = page.getByText("Design at the speed of thought");
	check("pre-headline text", (await pre.count()) === 1);
	const preFont = await pre.evaluate((el) => getComputedStyle(el).fontFamily);
	check(
		"pre-headline uses Instrument Serif",
		preFont.includes("Instrument Serif"),
		preFont,
	);

	const h1 = page.locator("h1");
	check("main headline text", (await h1.textContent()) === "Build Faster");
	const h1Styles = await h1.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			font: s.fontFamily,
			weight: s.fontWeight,
			clip: s.webkitBackgroundClip || s.backgroundClip,
			color: s.color,
			bgImage: s.backgroundImage,
			size: s.fontSize,
			opacity: s.opacity,
			transform: s.transform,
		};
	});
	check(
		"headline uses Instrument Sans semibold",
		h1Styles.font.includes("Instrument Sans") && h1Styles.weight === "600",
		`${h1Styles.font} / ${h1Styles.weight}`,
	);
	// Tailwind v4 emits `linear-gradient(in oklab, ...)`, which defaults to
	// "to bottom" (180deg) — assert clip, transparency, and the exact color stops.
	check(
		"headline gradient text effect",
		h1Styles.clip === "text" &&
			h1Styles.color === "rgba(0, 0, 0, 0)" &&
			h1Styles.bgImage.startsWith("linear-gradient(") &&
			h1Styles.bgImage.includes("rgb(255, 255, 255) 0%") &&
			h1Styles.bgImage.includes("rgb(255, 255, 255) 50%") &&
			h1Styles.bgImage.includes("rgb(180, 192, 255) 100%"),
		`${h1Styles.clip} / ${h1Styles.bgImage}`,
	);
	check(
		"headline 136px at lg viewport",
		h1Styles.size === "136px",
		h1Styles.size,
	);
	check(
		"headline animation settled (opacity 1, no scale)",
		h1Styles.opacity === "1" &&
			(h1Styles.transform === "none" ||
				h1Styles.transform === "matrix(1, 0, 0, 1, 0, 0)"),
		`${h1Styles.opacity} / ${h1Styles.transform}`,
	);

	const sub = page.getByText("Create fully functional, SEO-optimized");
	check("subheadline text", (await sub.count()) === 1);
	const subOpacity = await sub.evaluate((el) => getComputedStyle(el).opacity);
	check(
		"subheadline settled at opacity 0.7",
		Math.abs(parseFloat(subOpacity) - 0.7) < 0.01,
		subOpacity,
	);

	// ---- CTA buttons ----
	const primary = page.getByRole("button", { name: /Start Building Free/ });
	check("primary CTA present", (await primary.count()) === 1);
	const arrowCircle = await primary
		.locator("span")
		.nth(1)
		.evaluate((el) => {
			const s = getComputedStyle(el);
			return {
				bg: s.backgroundColor,
				w: s.width,
				h: s.height,
				radius: s.borderRadius,
			};
		});
	check(
		"primary CTA blue arrow circle 40px #3054ff",
		arrowCircle.bg === "rgb(48, 84, 255)" &&
			arrowCircle.w === "40px" &&
			arrowCircle.h === "40px",
		JSON.stringify(arrowCircle),
	);
	check(
		"secondary CTA present",
		(await page.getByRole("button", { name: /See Examples/ }).count()) === 1,
	);
	check(
		"lucide arrow icons rendered",
		(await page.locator("svg.lucide-arrow-right").count()) === 2,
	);

	// ---- Background layers ----
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	const videoState = await video.evaluate((v) => ({
		muted: v.muted,
		loop: v.loop,
		playsInline: v.playsInline,
		poster: v.poster,
		readyState: v.readyState,
		currentTime: v.currentTime,
		paused: v.paused,
		objectFit: getComputedStyle(v).objectFit,
		opacity: getComputedStyle(v).opacity,
	}));
	check(
		"video muted/loop/playsInline",
		videoState.muted && videoState.loop && videoState.playsInline,
	);
	check(
		"video poster fallback set",
		videoState.poster.includes("images.unsplash.com/photo-1647356191320"),
	);
	check(
		"video object-cover @ 60% opacity",
		videoState.objectFit === "cover" && videoState.opacity === "0.6",
		`${videoState.objectFit} / ${videoState.opacity}`,
	);
	check(
		"HLS stream playing",
		!videoState.paused &&
			videoState.readyState >= 2 &&
			videoState.currentTime > 0,
		`readyState=${videoState.readyState} t=${videoState.currentTime.toFixed(2)}s`,
	);

	check(
		"black/60 overlay with backdrop blur",
		(await page
			.locator("[class*='bg-black/60'][class*='backdrop-blur']")
			.count()) === 1,
	);
	check(
		"two mix-blend-screen gradient blobs",
		(await page.locator("[class*='mix-blend-screen']").count()) === 2,
	);

	// ---- Fonts actually loaded ----
	const fontsLoaded = await page.evaluate(async () => {
		await document.fonts.ready;
		return {
			sans: document.fonts.check("16px 'Instrument Sans'"),
			serif: document.fonts.check("16px 'Instrument Serif'"),
		};
	});
	check("Instrument Sans loaded", fontsLoaded.sans);
	check("Instrument Serif loaded", fontsLoaded.serif);

	check(
		"no console errors",
		consoleErrors.length === 0,
		consoleErrors.join(" | ").slice(0, 300),
	);

	// ---- Screenshots (desktop + mobile) ----
	mkdirSync("screenshots", { recursive: true });
	await page.screenshot({ path: "screenshots/desktop.png" });
	const mobile = await browser.newPage({
		viewport: { width: 390, height: 844 },
	});
	await mobile.goto(URL_BASE, { waitUntil: "networkidle" });
	await mobile.waitForTimeout(1500);
	await mobile.screenshot({ path: "screenshots/mobile.png" });
	console.log(
		"[INFO] screenshots saved to screenshots/desktop.png and screenshots/mobile.png",
	);
} finally {
	await browser.close();
	preview.kill();
}

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
