/* Headless verification of the CodeNest hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4733) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4733";
const MINT = "rgb(94, 210, 156)"; // #5ed29c
const INK = "rgb(7, 11, 10)"; // #070b0a

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

async function launch() {
	try {
		/* Prefer system Chrome for full media codec support (h264/aac). */
		return await chromium.launch({
			channel: "chrome",
			args: ["--autoplay-policy=no-user-gesture-required"],
		});
	} catch {
		return chromium.launch({
			args: ["--autoplay-policy=no-user-gesture-required"],
		});
	}
}

const browser = await launch();

/* ---------------- Desktop (1440x900) ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	await page.goto(BASE, { waitUntil: "networkidle" });
	await page.waitForTimeout(2400); // let staggered entrance animations finish

	/* Background video + hls.js */
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	const v = await video.evaluate((el) => ({
		src: el.src,
		autoplay: el.autoplay,
		muted: el.muted,
		loop: el.loop,
		playsInline: el.playsInline,
		opacity: getComputedStyle(el).opacity,
		objectFit: getComputedStyle(el).objectFit,
		width: el.getBoundingClientRect().width,
		height: el.getBoundingClientRect().height,
	}));
	check(
		"hls.js attached MediaSource (blob: src)",
		v.src.startsWith("blob:"),
		v.src.slice(0, 30),
	);
	check(
		"video autoplay/muted/loop/playsInline",
		v.autoplay && v.muted && v.loop && v.playsInline,
	);
	check("video opacity 60%", v.opacity === "0.6", v.opacity);
	check("video object-fit cover", v.objectFit === "cover");
	check(
		"video covers viewport",
		v.width >= 1440 && v.height >= 900,
		`${v.width}x${v.height}`,
	);

	const playing = await video.evaluate(
		(el) =>
			new Promise((resolve) => {
				const deadline = Date.now() + 15000;
				const tick = () => {
					if (el.currentTime > 0.1 && !el.paused) return resolve(true);
					if (Date.now() > deadline) return resolve(false);
					setTimeout(tick, 200);
				};
				tick();
			}),
	);
	check("HLS video is actually playing (currentTime advancing)", playing);

	/* Grid lines at 25/50/75% */
	const lines = page.locator('[data-testid="grid-line"]');
	check("three vertical grid lines", (await lines.count()) === 3);
	const xs = await lines.evaluateAll((els) =>
		els.map((el) => Math.round(el.getBoundingClientRect().x)),
	);
	check(
		"grid lines at 25/50/75% (360/720/1080px @1440)",
		xs[0] === 360 && xs[1] === 720 && xs[2] === 1080,
		xs.join(","),
	);
	check(
		"grid lines visible on desktop",
		await lines
			.first()
			.evaluate((el) => getComputedStyle(el.parentElement).display !== "none"),
	);

	/* Central glow */
	const glow = page.locator('[data-testid="central-glow"]');
	check("central glow SVG present", (await glow.count()) === 1);
	check(
		"gaussian blur stdDeviation = 25",
		(await glow.locator("feGaussianBlur").getAttribute("stdDeviation")) ===
			"25",
	);

	/* Liquid glass card */
	const card = page.locator('[data-testid="glass-card"]');
	const c = await card.evaluate((el) => {
		const cs = getComputedStyle(el);
		const before = getComputedStyle(el, "::before");
		return {
			width: el.getBoundingClientRect().width,
			height: el.getBoundingClientRect().height,
			transform: cs.transform,
			background: cs.backgroundColor,
			blend: cs.backgroundBlendMode,
			backdrop: cs.backdropFilter || cs.webkitBackdropFilter,
			shadow: cs.boxShadow,
			beforePadding: before.padding,
			beforeMaskComposite: before.maskComposite || before.webkitMaskComposite,
			beforeBg: before.backgroundImage,
		};
	});
	check(
		"card is 200x200px",
		c.width === 200 && c.height === 200,
		`${c.width}x${c.height}`,
	);
	check(
		"card shifted -50px (translate-y-[-50px])",
		c.transform === "matrix(1, 0, 0, 1, 0, -50)",
		c.transform,
	);
	check(
		"card bg rgba(255,255,255,0.01)",
		c.background === "rgba(255, 255, 255, 0.01)",
		c.background,
	);
	check(
		"card background-blend-mode luminosity",
		c.blend === "luminosity",
		c.blend,
	);
	check(
		"card backdrop-filter blur(4px)",
		c.backdrop === "blur(4px)",
		c.backdrop,
	);
	check("card inset highlight shadow", c.shadow.includes("inset"), c.shadow);
	check(
		"::before border padding 1.4px",
		c.beforePadding === "1.4px",
		c.beforePadding,
	);
	check(
		"::before mask-composite exclude/xor",
		/exclude|xor/.test(c.beforeMaskComposite),
		c.beforeMaskComposite,
	);
	check(
		"::before 180deg gradient frame",
		c.beforeBg.includes("linear-gradient"),
		c.beforeBg.slice(0, 40),
	);

	check(
		'card tag "[ 2025 ]" visible',
		await page.getByText("[ 2025 ]").isVisible(),
	);
	const serif = page.locator("em", { hasText: "Industry" });
	const serifCss = await serif.evaluate((el) => {
		const cs = getComputedStyle(el);
		return { family: cs.fontFamily, style: cs.fontStyle };
	});
	check(
		'"Industry" in Instrument Serif italic',
		serifCss.family.includes("Instrument Serif") && serifCss.style === "italic",
		`${serifCss.family} / ${serifCss.style}`,
	);

	/* Eyebrow */
	const eyebrow = page.getByText("Career-Ready Curriculum");
	const e = await eyebrow.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			family: cs.fontFamily,
			size: cs.fontSize,
			weight: cs.fontWeight,
			color: cs.color,
		};
	});
	check(
		"eyebrow Plus Jakarta Sans",
		e.family.includes("Plus Jakarta Sans"),
		e.family,
	);
	check(
		"eyebrow 11px bold",
		e.size === "11px" && e.weight === "700",
		`${e.size}/${e.weight}`,
	);
	check("eyebrow color #5ed29c", e.color === MINT, e.color);

	/* Headline */
	const h1 = page.locator("h1");
	const h = await h1.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			text: el.textContent.replace(/\s+/g, " ").trim(),
			family: cs.fontFamily,
			size: cs.fontSize,
			weight: cs.fontWeight,
			transform: cs.textTransform,
			tracking: parseFloat(cs.letterSpacing),
			periodColor: getComputedStyle(el.querySelector("span")).color,
		};
	});
	check("headline text exact", h.text === "LAUNCH YOUR CODING CAREER.", h.text);
	check(
		"headline Inter Extra Bold",
		h.family.startsWith("Inter") && h.weight === "800",
		`${h.family}/${h.weight}`,
	);
	check("headline 72px on desktop", h.size === "72px", h.size);
	check(
		"headline uppercase + tracking-tight",
		h.transform === "uppercase" && h.tracking < 0,
		`${h.transform}/${h.tracking}px`,
	);
	check("final period is green", h.periodColor === MINT, h.periodColor);

	/* Description */
	const desc = page.getByText(/Master in-demand coding skills/);
	const d = await desc.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			size: cs.fontSize,
			color: cs.color,
			maxWidth: cs.maxWidth,
			family: cs.fontFamily,
		};
	});
	check(
		"description Inter 14px",
		d.family.startsWith("Inter") && d.size === "14px",
		`${d.family}/${d.size}`,
	);
	check(
		"description 70% white",
		d.color === "rgba(255, 255, 255, 0.7)",
		d.color,
	);
	check("description max-width 512px", d.maxWidth === "512px", d.maxWidth);

	/* CTA */
	const cta = page.getByRole("button", { name: /get started/i });
	const b = await cta.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			bg: cs.backgroundColor,
			color: cs.color,
			radius: cs.borderRadius,
			transform: cs.textTransform,
			weight: cs.fontWeight,
			hasIcon: !!el.querySelector("svg"),
		};
	});
	check("CTA bg #5ed29c", b.bg === MINT, b.bg);
	check("CTA text #070b0a", b.color === INK, b.color);
	check(
		"CTA pill / uppercase / bold",
		parseFloat(b.radius) > 100 &&
			b.transform === "uppercase" &&
			b.weight === "700",
		`${b.radius}/${b.transform}/${b.weight}`,
	);
	check("CTA has ArrowRight icon", b.hasIcon);

	/* Navigation */
	check(
		'logo "CODENEST" visible',
		await page.getByText("CODENEST").first().isVisible(),
	);
	const nav = page.locator('nav[aria-label="Primary"]');
	for (const item of ["PROJECTS", "BLOG", "ABOUT", "RESUME"]) {
		check(
			`desktop nav "${item}" visible`,
			await nav.getByText(item).isVisible(),
		);
	}
	const navLink = nav.getByText("PROJECTS");
	check(
		"nav links 16px Inter",
		(await navLink.evaluate((el) => getComputedStyle(el).fontSize)) === "16px",
	);
	await navLink.hover();
	await page.waitForTimeout(350);
	check(
		"nav hover -> #5ed29c",
		(await navLink.evaluate((el) => getComputedStyle(el).color)) === MINT,
		await navLink.evaluate((el) => getComputedStyle(el).color),
	);
	check(
		"hamburger hidden on desktop",
		!(await page.getByRole("button", { name: "Open menu" }).isVisible()),
	);

	await page.screenshot({ path: "/tmp/codenest-desktop.png" });
	await page.close();
}

/* ---------------- Mobile (390x844) ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await page.goto(BASE, { waitUntil: "networkidle" });
	await page.waitForTimeout(2400);

	check(
		"desktop nav hidden on mobile",
		!(await page
			.locator('nav[aria-label="Primary"]')
			.getByText("PROJECTS")
			.isVisible()),
	);
	check(
		"grid lines hidden on mobile",
		await page
			.locator('[data-testid="grid-line"]')
			.first()
			.evaluate((el) => getComputedStyle(el.parentElement).display === "none"),
	);
	check(
		"headline 40px on mobile",
		(await page
			.locator("h1")
			.evaluate((el) => getComputedStyle(el).fontSize)) === "40px",
		await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize),
	);

	const toggle = page.getByRole("button", { name: "Open menu" });
	check("hamburger visible on mobile", await toggle.isVisible());

	await toggle.click();
	const overlay = page.locator("#mobile-menu");
	await overlay.waitFor({ state: "visible" });
	const o = await overlay.evaluate((el) => {
		const r = el.getBoundingClientRect();
		const cs = getComputedStyle(el);
		return {
			w: r.width,
			h: r.height,
			x: r.x,
			y: r.y,
			position: cs.position,
			bg: cs.backgroundColor,
		};
	});
	check(
		"overlay is full-screen fixed",
		o.position === "fixed" &&
			o.x === 0 &&
			o.y === 0 &&
			o.w === 390 &&
			o.h === 844,
		`${o.w}x${o.h}@${o.x},${o.y}`,
	);
	check("overlay is dark (#070b0a)", o.bg.startsWith("rgba(7, 11, 10"), o.bg);
	const overlayLinks = await overlay.locator("nav a").count();
	check("overlay lists 4 menu links", overlayLinks === 4, String(overlayLinks));
	check(
		"body scroll locked while open",
		(await page.evaluate(() => document.body.style.overflow)) === "hidden",
	);

	await page.waitForTimeout(1500); // let overlay link stagger animation settle
	await page.screenshot({ path: "/tmp/codenest-mobile-menu.png" });

	await page.getByRole("button", { name: "Close menu" }).click();
	await overlay.waitFor({ state: "detached" });
	check(
		"overlay closes via X",
		(await page.locator("#mobile-menu").count()) === 0,
	);

	await page.screenshot({ path: "/tmp/codenest-mobile.png" });
	await page.close();
}

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
