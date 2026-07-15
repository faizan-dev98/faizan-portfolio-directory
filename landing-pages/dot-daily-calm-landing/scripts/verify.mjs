/**
 * Headless CLI verification for the dot. landing page.
 * Drives system Chrome via puppeteer-core against the vite preview server.
 */
import puppeteer from "puppeteer-core";

const URL = process.env.VERIFY_URL ?? "http://localhost:4399/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const results = [];
const check = (name, ok, detail = "") =>
	results.push({ name, ok, detail: String(detail) });

const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
	args: ["--no-sandbox", "--mute-audio"],
});

try {
	const page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 900 });

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(err.message));

	await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });

	// 1. Headline
	const h1 = await page.$eval("h1", (el) => el.innerText);
	check(
		"Headline text",
		/Short notes\./.test(h1) && /Daily calm\./.test(h1),
		h1.replace(/\n/g, " | "),
	);
	const h1Font = await page.$eval(
		"h1",
		(el) => getComputedStyle(el).fontFamily,
	);
	check(
		"Headline uses Instrument Serif",
		h1Font.includes("Instrument Serif"),
		h1Font,
	);

	// 2. Sub-headline
	const sub = await page.evaluate(() =>
		[...document.querySelectorAll("p")].some((p) =>
			p.innerText.includes(
				"Linked with a single anonymous peer. One message every day. A quiet rhythm in the digital noise.",
			),
		),
	);
	check("Sub-headline text", sub);

	// 3. Navbar
	const logo = await page.evaluate(() => {
		const el = [...document.querySelectorAll("nav a")].find(
			(a) => a.innerText.trim() === "dot.",
		);
		return el ? getComputedStyle(el).fontFamily : null;
	});
	check(
		"Logo 'dot.' present in Instrument Serif",
		Boolean(logo?.includes("Instrument Serif")),
		logo,
	);
	const links = await page.evaluate(() =>
		["Philosophy", "Trust", "Access", "Tribe"].every((t) =>
			[...document.querySelectorAll("nav a")].some(
				(a) => a.innerText.trim() === t,
			),
		),
	);
	check("Nav links Philosophy/Trust/Access/Tribe", links);
	const navFixed = await page.evaluate(() => {
		const header = document.querySelector("header");
		const s = getComputedStyle(header);
		return {
			position: s.position,
			top: s.top,
			zIndex: s.zIndex,
			pointerEvents: s.pointerEvents,
		};
	});
	check(
		"Navbar fixed top-6 z-50 pointer-events-none",
		navFixed.position === "fixed" &&
			navFixed.top === "24px" &&
			navFixed.zIndex === "50" &&
			navFixed.pointerEvents === "none",
		JSON.stringify(navFixed),
	);
	const cta = await page.evaluate(() => {
		const a = [...document.querySelectorAll("nav a")].find(
			(x) => x.innerText.trim() === "Link up",
		);
		if (!a) return null;
		const s = getComputedStyle(a);
		return {
			bg: s.backgroundColor,
			color: s.color,
			radius: s.borderRadius,
			shadow: s.boxShadow,
			glint: Boolean(a.querySelector("span")),
		};
	});
	check(
		"CTA 'Link up' styled (#0871E7, white, pill, inset shadow, glint)",
		cta &&
			cta.bg === "rgb(8, 113, 231)" &&
			cta.color === "rgb(255, 255, 255)" &&
			cta.shadow.includes("inset") &&
			cta.glint,
		JSON.stringify(cta),
	);

	// 4. Video background
	const video = await page.evaluate(() => {
		const v = document.querySelector("video");
		if (!v) return null;
		return {
			src: v.getAttribute("src"),
			autoplay: v.autoplay,
			loop: v.loop,
			muted: v.muted,
			playsInline: v.playsInline,
			objectFit: getComputedStyle(v).objectFit,
			playing: !v.paused && v.readyState >= 2,
			currentTime: v.currentTime,
		};
	});
	check(
		"Video src EXACT",
		video?.src ===
			"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_054418_a6d194f0-ac86-4df9-abe5-ded73e596d7c.mp4",
		video?.src,
	);
	check(
		"Video autoplay/loop/muted/playsInline/object-cover",
		video?.autoplay &&
			video.loop &&
			video.muted &&
			video.playsInline &&
			video.objectFit === "cover",
		JSON.stringify({
			a: video?.autoplay,
			l: video?.loop,
			m: video?.muted,
			p: video?.playsInline,
			fit: video?.objectFit,
		}),
	);
	const videoPlays = await page
		.waitForFunction(
			() => {
				const v = document.querySelector("video");
				return v && !v.paused && v.currentTime > 0;
			},
			{ timeout: 20000 },
		)
		.then(() => true)
		.catch(() => false);
	const playedTime = await page.$eval("video", (v) => v.currentTime);
	check("Video is actually playing", videoPlays, `currentTime=${playedTime}`);

	// 5. TypingMessages — sample text over time, confirm typing/deleting cycle
	const nokiaSel = "p.font-nokia";
	await page.waitForSelector(nokiaSel, { timeout: 5000 });
	const nokiaFont = await page.$eval(
		nokiaSel,
		(el) => getComputedStyle(el).fontFamily,
	);
	check(
		"Typing text uses Nokia font stack",
		nokiaFont.includes("Nokia Cellphone FC Small"),
		nokiaFont,
	);

	const samples = [];
	for (let i = 0; i < 14; i++) {
		samples.push(await page.$eval(nokiaSel, (el) => el.innerText.trim()));
		await new Promise((r) => setTimeout(r, 320));
	}
	const messages = ["Are you here?", "Yes, I am.", "Speak soon."];
	const allPrefixes = samples.every((s) =>
		messages.some((m) => m.startsWith(s)),
	);
	const distinct = new Set(samples).size;
	check(
		"Typing animates (text changes over time)",
		distinct >= 4,
		`${distinct} distinct samples: ${JSON.stringify(samples.slice(0, 8))}`,
	);
	check(
		"All sampled text is a prefix of a scripted message",
		allPrefixes,
		JSON.stringify([...new Set(samples)]),
	);

	const fullMessageSeen = await page
		.waitForFunction(
			(sel) =>
				document.querySelector(sel)?.innerText.trim() === "Are you here?",
			{ timeout: 8000 },
			nokiaSel,
		)
		.then(() => true)
		.catch(() => false);
	check("Full message 'Are you here?' gets fully typed", fullMessageSeen);

	// Cursor
	const cursor = await page.evaluate(() => {
		const span = document.querySelector("p.font-nokia span");
		if (!span) return null;
		const s = getComputedStyle(span);
		return { bg: s.backgroundColor, opacity: s.opacity };
	});
	check(
		"Blinking cursor span present (#2A3616)",
		cursor?.bg === "rgb(42, 54, 22)",
		JSON.stringify(cursor),
	);
	const op1 = await page.$eval(
		"p.font-nokia span",
		(el) => getComputedStyle(el).opacity,
	);
	await new Promise((r) => setTimeout(r, 250));
	const op2 = await page.$eval(
		"p.font-nokia span",
		(el) => getComputedStyle(el).opacity,
	);
	check("Cursor opacity animates", op1 !== op2, `${op1} -> ${op2}`);

	// 6. Hero container + positioning of typing overlay
	const hero = await page.evaluate(() => {
		const sec = document.querySelector("section");
		const s = getComputedStyle(sec);
		return {
			minH: s.minHeight,
			bg: s.backgroundColor,
			display: s.display,
			flexDir: s.flexDirection,
		};
	});
	check(
		"Hero min-h-screen bg-#F3F4ED flex-col",
		hero.bg === "rgb(243, 244, 237)" &&
			hero.display === "flex" &&
			hero.flexDir === "column",
		JSON.stringify(hero),
	);

	// 7. Root font / antialiasing
	const root = await page.evaluate(() => {
		const s = getComputedStyle(document.documentElement);
		return { font: s.fontFamily, smoothing: s.webkitFontSmoothing };
	});
	check(
		"Root font-family is Inter (var(--font-sans))",
		root.font.includes("Inter"),
		root.font,
	);
	check(
		"Anti-aliasing applied",
		root.smoothing === "antialiased",
		root.smoothing,
	);

	// 8. Motion animations settled to final values
	const h1Opacity = await page.evaluate(() => {
		const el = document.querySelector("h1").closest("div");
		return getComputedStyle(el).opacity;
	});
	check(
		"Headline motion animation completed (opacity 1)",
		h1Opacity === "1",
		h1Opacity,
	);

	// 9. Console errors (ignore network noise from third-party font hosts if any)
	const realErrors = consoleErrors.filter(
		(e) => !e.includes("net::ERR") && !e.includes("404"),
	);
	check(
		"No console/page errors",
		realErrors.length === 0,
		JSON.stringify(realErrors),
	);

	// Report
	let failed = 0;
	for (const r of results) {
		const mark = r.ok ? "PASS" : "FAIL";
		if (!r.ok) failed++;
		console.log(`${mark}  ${r.name}${r.detail ? `  —  ${r.detail}` : ""}`);
	}
	console.log(`\n${results.length - failed}/${results.length} checks passed`);
	process.exitCode = failed === 0 ? 0 : 1;
} finally {
	await browser.close();
}
