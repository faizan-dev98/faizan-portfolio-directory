/**
 * Headless verification of the built page (CLI only).
 *
 * Serves dist/ via `vite preview`, drives headless Chromium with Playwright,
 * and asserts every requirement from prompt.md that is machine-checkable.
 *
 * Run: npm run build && node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.env.VERIFY_PORT ?? 4519);
const URL = `http://localhost:${PORT}/`;

let passed = 0;
let failed = 0;
const check = (name, ok, detail = "") => {
	if (ok) {
		passed++;
		console.log(`  ✓ ${name}`);
	} else {
		failed++;
		console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
	}
};

// ---- start preview server ----
const server = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{
		cwd: process.cwd(),
		stdio: ["ignore", "pipe", "pipe"],
	},
);
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
let serverDead = false;
server.on("exit", () => (serverDead = true));

// Poll until the server answers (readiness via HTTP, not log parsing)
{
	const deadline = Date.now() + 20000;
	let up = false;
	while (Date.now() < deadline && !serverDead) {
		try {
			const res = await fetch(URL);
			if (res.ok) {
				up = true;
				break;
			}
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	if (!up) {
		console.error(`preview server failed to start:\n${serverLog}`);
		server.kill();
		process.exit(1);
	}
}

const browser = await chromium.launch();
try {
	// ================= Desktop =================
	console.log("\nDesktop (1440×900)");
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	const consoleErrors = [];
	page.on(
		"console",
		(m) => m.type() === "error" && consoleErrors.push(m.text()),
	);
	page.on("pageerror", (e) => consoleErrors.push(String(e)));
	await page.goto(URL, { waitUntil: "networkidle" });

	// Video background
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	const v = await video.evaluate((el) => ({
		autoplay: el.autoplay,
		loop: el.loop,
		muted: el.muted,
		playsInline: el.playsInline,
		src: el.src,
		objectFit: getComputedStyle(el).objectFit,
		zIndex: getComputedStyle(el).zIndex,
		position: getComputedStyle(el).position,
	}));
	check(
		"video autoplay + loop + muted + playsInline",
		v.autoplay && v.loop && v.muted && v.playsInline,
		JSON.stringify(v),
	);
	check(
		"video src is the CloudFront mp4",
		v.src.includes("d8j0ntlcm91z4.cloudfront.net") && v.src.endsWith(".mp4"),
	);
	check(
		"video object-cover at z-0",
		v.objectFit === "cover" && v.zIndex === "0",
	);
	const playing = await video.evaluate(
		(el) =>
			new Promise((resolve) => {
				const done = () =>
					resolve({
						paused: el.paused,
						t: el.currentTime,
						ready: el.readyState,
					});
				if (el.readyState >= 2) setTimeout(done, 600);
				else
					el.addEventListener("loadeddata", () => setTimeout(done, 600), {
						once: true,
					});
				setTimeout(done, 8000);
			}),
	);
	check(
		"video is actually playing",
		!playing.paused && playing.t > 0,
		JSON.stringify(playing),
	);

	// Headline + typography
	const h1 = page.locator("h1");
	const h1Text = (await h1.innerText()).replace(/\s+/g, " ").trim();
	check(
		'h1 reads "Innovating the spirit of bloom AI"',
		/Innovating the\s*spirit of bloom\s*AI/i.test(h1Text),
		h1Text,
	);
	const h1Style = await h1.evaluate((el) => {
		const s = getComputedStyle(el);
		const em = el.querySelector("em");
		const es = em ? getComputedStyle(em) : null;
		return {
			fontFamily: s.fontFamily,
			fontWeight: s.fontWeight,
			letterSpacing: s.letterSpacing,
			emFamily: es?.fontFamily,
			emStyle: es?.fontStyle,
			emColor: es?.color,
		};
	});
	check(
		"h1 uses Poppins at weight 500",
		h1Style.fontFamily.includes("Poppins") && h1Style.fontWeight === "500",
		JSON.stringify(h1Style),
	);
	check(
		"h1 <em> uses Source Serif 4 italic",
		(h1Style.emFamily ?? "").includes("Source Serif 4") &&
			h1Style.emStyle === "italic",
		JSON.stringify(h1Style),
	);
	check(
		"h1 em is white/80",
		h1Style.emColor === "rgba(255, 255, 255, 0.8)",
		h1Style.emColor,
	);

	// Fonts actually loaded
	const fontsOk = await page.evaluate(async () => {
		await document.fonts.ready;
		return {
			poppins: document.fonts.check('500 16px "Poppins"'),
			serif: document.fonts.check('italic 16px "Source Serif 4"'),
		};
	});
	check(
		"Poppins + Source Serif 4 loaded",
		fontsOk.poppins && fontsOk.serif,
		JSON.stringify(fontsOk),
	);

	// Liquid glass tiers
	const glass = await page.evaluate(() => {
		const light = document.querySelector(
			".liquid-glass:not(.liquid-glass-strong)",
		);
		const strong = document.querySelector(".liquid-glass-strong");
		const gs = (el) => getComputedStyle(el);
		const before = (el) => getComputedStyle(el, "::before");
		return {
			lightBlur: gs(light).backdropFilter,
			strongBlur: gs(strong).backdropFilter,
			lightBlend: gs(light).backgroundBlendMode,
			lightBeforePadding: before(light).padding,
			strongBeforePadding: before(strong).padding,
			lightBeforeBg: before(light).backgroundImage,
			counts: {
				light: document.querySelectorAll(".liquid-glass").length,
				strong: document.querySelectorAll(".liquid-glass-strong").length,
			},
		};
	});
	check(
		"`.liquid-glass` backdrop blur(4px) + luminosity blend",
		glass.lightBlur === "blur(4px)" && glass.lightBlend === "luminosity",
		JSON.stringify(glass),
	);
	check(
		"`.liquid-glass-strong` backdrop blur(50px)",
		glass.strongBlur === "blur(50px)",
		glass.strongBlur,
	);
	check(
		"::before gradient ring with 1.4px padding (both tiers)",
		glass.lightBeforePadding === "1.4px" &&
			glass.strongBeforePadding === "1.4px" &&
			glass.lightBeforeBg.includes("linear-gradient"),
		JSON.stringify(glass),
	);

	// Layout split
	const widths = await page.evaluate(() => {
		const main = document.querySelector("main");
		const [left, right] = [
			main.querySelector("section"),
			main.querySelector("aside"),
		];
		return {
			total: main.clientWidth,
			left: left.clientWidth / main.clientWidth,
			rightVisible: getComputedStyle(right).display !== "none",
			right: right.clientWidth / main.clientWidth,
		};
	});
	check(
		"left panel ≈52% / right ≈48%",
		Math.abs(widths.left - 0.52) < 0.01 &&
			Math.abs(widths.right - 0.48) < 0.01 &&
			widths.rightVisible,
		JSON.stringify(widths),
	);

	// Content inventory
	for (const text of [
		"bloom",
		"Menu",
		"Explore Now",
		"Artistic Gallery",
		"AI Generation",
		"3D Structures",
		"Visionary Design",
		"MARCUS AURELIO",
		"We imagined a",
		"Account",
		"Enter our ecosystem",
		"Processing",
		"Growth Archive",
		"Advanced Plant Sculpting",
	]) {
		check(
			`content: "${text}"`,
			(await page.getByText(text, { exact: false }).count()) >= 1,
		);
	}

	// Social links
	const socials = await page.evaluate(() =>
		[
			...document.querySelectorAll(
				'a[aria-label="Twitter"],a[aria-label="LinkedIn"],a[aria-label="Instagram"]',
			),
		].map((a) => getComputedStyle(a).transitionProperty),
	);
	check(
		"3 social links with color transition",
		socials.length === 3 && socials.every((t) => t.includes("color")),
		JSON.stringify(socials),
	);

	// Images render (logo + flower thumb)
	const images = await page.evaluate(() =>
		[...document.querySelectorAll("img")].map((i) => ({
			src: i.src.split("/").pop(),
			ok: i.complete && i.naturalWidth > 0,
		})),
	);
	check(
		"all images loaded (logo ×2 + hero-flowers)",
		images.length === 3 && images.every((i) => i.ok),
		JSON.stringify(images),
	);

	// Strict grayscale: every computed color on the page has R=G=B
	const offGray = await page.evaluate(() => {
		const bad = [];
		for (const el of document.querySelectorAll("*")) {
			const s = getComputedStyle(el);
			for (const prop of ["color", "backgroundColor", "boxShadow"]) {
				for (const m of (s[prop] ?? "").matchAll(
					/rgba?\((\d+),\s*(\d+),\s*(\d+)/g,
				)) {
					const [, r, g, b] = m.map(Number);
					if (r !== g || g !== b)
						bad.push(`${el.tagName}.${el.className} ${prop}: ${s[prop]}`);
				}
			}
		}
		return bad.slice(0, 5);
	});
	check(
		"strict grayscale (no colored accents anywhere)",
		offGray.length === 0,
		offGray.join(" | "),
	);

	// No border-* utility classes
	const borderClasses = await page.evaluate(
		() =>
			[...document.querySelectorAll("*")].filter((el) =>
				/(^|\s)border(-|\s|$)/.test(
					el.className?.baseVal ?? el.className ?? "",
				),
			).length,
	);
	check(
		"no border-* classes anywhere",
		borderClasses === 0,
		String(borderClasses),
	);

	// --radius token
	const radius = await page.evaluate(() =>
		getComputedStyle(document.documentElement)
			.getPropertyValue("--radius")
			.trim(),
	);
	check("--radius token is 1rem", radius === "1rem", radius);

	await page.screenshot({
		path: "scripts/screenshot-desktop.png",
		fullPage: false,
	});
	console.log("  ⤷ screenshot: scripts/screenshot-desktop.png");

	check(
		"no console/page errors",
		consoleErrors.length === 0,
		consoleErrors.join(" | "),
	);
	await page.close();

	// ================= Mobile =================
	console.log("\nMobile (390×844)");
	const mobile = await browser.newPage({
		viewport: { width: 390, height: 844 },
	});
	await mobile.goto(URL, { waitUntil: "networkidle" });
	const mobileState = await mobile.evaluate(() => ({
		rightHidden:
			getComputedStyle(document.querySelector("aside")).display === "none",
		leftFull:
			document.querySelector("section").clientWidth ===
			document.querySelector("main").clientWidth,
		h1Visible: !!document.querySelector("h1")?.checkVisibility(),
	}));
	check("right panel hidden on mobile", mobileState.rightHidden);
	check(
		"left panel full-width with visible h1",
		mobileState.leftFull && mobileState.h1Visible,
		JSON.stringify(mobileState),
	);
	await mobile.screenshot({ path: "scripts/screenshot-mobile.png" });
	console.log("  ⤷ screenshot: scripts/screenshot-mobile.png");
	await mobile.close();
} finally {
	await browser.close();
	server.kill();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
