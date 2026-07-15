/* Headless verification of the Power AI hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4861) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4861";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";
const BRANDS = ["Vortex", "Nimbus", "Prysma", "Cirrus", "Kynder", "Halcyn"];

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};
const approx = (a, b, eps = 0.75) => Math.abs(a - b) <= eps;

const browser = await chromium.launch();

/* ---------------- Desktop (1440x900) ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	await page.goto(BASE, { waitUntil: "networkidle" });

	/* Theme variables */
	const vars = await page.evaluate(() => {
		const cs = getComputedStyle(document.documentElement);
		return {
			background: cs.getPropertyValue("--background").trim(),
			foreground: cs.getPropertyValue("--foreground").trim(),
			heroSub: cs.getPropertyValue("--hero-sub").trim(),
			bodyFont: getComputedStyle(document.body).fontFamily,
		};
	});
	check(
		"--background is 260 87% 3%",
		vars.background === "260 87% 3%",
		vars.background,
	);
	check(
		"--foreground is 40 6% 95%",
		vars.foreground === "40 6% 95%",
		vars.foreground,
	);
	check("--hero-sub is 40 6% 82%", vars.heroSub === "40 6% 82%", vars.heroSub);
	check(
		"body font is Geist Sans",
		vars.bodyFont.includes("Geist Sans"),
		vars.bodyFont,
	);

	/* Background video element */
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	check(
		"video src is exact CloudFront URL",
		(await video.getAttribute("src")) === VIDEO_URL,
	);

	const v = await video.evaluate((el) => {
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		return {
			autoplay: el.autoplay,
			muted: el.muted,
			loopAttr: el.loop,
			playsInline: el.playsInline,
			objectFit: cs.objectFit,
			position: cs.position,
			width: r.width,
			height: r.height,
		};
	});
	check(
		"video autoplay + muted + playsInline",
		v.autoplay && v.muted && v.playsInline,
	);
	check("video has NO native loop (custom JS loop)", v.loopAttr === false);
	check(
		"video absolute + object-cover",
		v.position === "absolute" && v.objectFit === "cover",
	);
	check(
		"video covers viewport",
		v.width >= 1440 && v.height >= 900,
		`${v.width}x${v.height}`,
	);

	const wrapperOverflow = await video.evaluate(
		(el) => getComputedStyle(el.parentElement).overflow,
	);
	check(
		"wrapper div has overflow-hidden",
		wrapperOverflow === "hidden",
		wrapperOverflow,
	);

	const contentLayer = await page.evaluate(() => {
		const el = document.querySelector("video").nextElementSibling;
		const cs = getComputedStyle(el);
		return { position: cs.position, zIndex: cs.zIndex };
	});
	check(
		"content sits in relative z-10 layer above video",
		contentLayer.position === "relative" && contentLayer.zIndex === "10",
		JSON.stringify(contentLayer),
	);

	/* Fade loop behavior: starts at 0, fades in to ~1, fades out near the end,
     and on ended resets to 0 then replays from the start. */
	const fade = await video.evaluate(
		(el) =>
			new Promise((resolve) => {
				const result = {};
				const fail = (stage) => resolve({ ...result, failedAt: stage });
				const waitFor = (cond, ms, then, stage) => {
					const deadline = Date.now() + ms;
					const poll = () => {
						if (cond()) return then();
						if (Date.now() > deadline) return fail(stage);
						setTimeout(poll, 50);
					};
					poll();
				};
				// 1) plays and fades in
				waitFor(
					() => !el.paused && el.currentTime > 0.7,
					20000,
					() => {
						result.fadedInOpacity = parseFloat(el.style.opacity);
						// 2) jump near the end → opacity must drop (fade-out window)
						el.currentTime = Math.max(el.duration - 0.25, 0);
						waitFor(
							() => parseFloat(el.style.opacity) < 0.6,
							5000,
							() => {
								result.fadeOutOpacity = parseFloat(el.style.opacity);
								// 3) ended → opacity snaps to 0
								waitFor(
									() => el.ended,
									8000,
									() => {
										result.opacityAtEnd = parseFloat(el.style.opacity);
										// 4) replays from the start after ~100ms and fades back in
										waitFor(
											() =>
												!el.ended && el.currentTime < 1.5 && el.currentTime > 0,
											6000,
											() => {
												result.replayed = true;
												resolve(result);
											},
											"replay",
										);
									},
									"ended",
								);
							},
							"fade-out",
						);
					},
					"fade-in",
				);
			}),
	);
	check(
		"video fades in to ~1 after start",
		fade.fadedInOpacity !== undefined && fade.fadedInOpacity > 0.9,
		`opacity=${fade.fadedInOpacity}${fade.failedAt ? ` (failed at ${fade.failedAt})` : ""}`,
	);
	check(
		"video fades out near the end",
		fade.fadeOutOpacity !== undefined && fade.fadeOutOpacity < 0.6,
		`opacity=${fade.fadeOutOpacity}`,
	);
	check(
		"on ended opacity resets to 0",
		fade.opacityAtEnd !== undefined && fade.opacityAtEnd <= 0.05,
		`opacity=${fade.opacityAtEnd}`,
	);
	check("video replays from 0 after ended", fade.replayed === true);

	/* No gradient overlay divs on the video (sibling overlays) */
	const overlayCount = await page.evaluate(() => {
		const wrapper = document.querySelector("video").parentElement;
		return [...wrapper.children].filter((el) => {
			const bg = getComputedStyle(el).backgroundImage;
			return el.tagName !== "VIDEO" && bg.includes("gradient");
		}).length;
	});
	check("no gradient overlays on the video", overlayCount === 0);

	/* Blurred overlay shape */
	const blur = await page.evaluate(() => {
		const els = [...document.querySelectorAll("section *")];
		const el = els.find((e) =>
			getComputedStyle(e).filter.includes("blur(82px)"),
		);
		if (!el) return null;
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		return {
			w: r.width,
			h: r.height,
			opacity: cs.opacity,
			pointerEvents: cs.pointerEvents,
			cx: r.left + r.width / 2,
			cy: r.top + r.height / 2,
		};
	});
	check("blur shape exists with blur(82px)", blur !== null);
	if (blur) {
		check(
			"blur shape is 984x527",
			approx(blur.w, 984) && approx(blur.h, 527),
			`${blur.w}x${blur.h}`,
		);
		check(
			"blur shape opacity 0.9 + pointer-events none",
			blur.opacity === "0.9" && blur.pointerEvents === "none",
		);
		check(
			"blur shape centered",
			approx(blur.cx, 720, 2) && approx(blur.cy, 450, 2),
			`${blur.cx},${blur.cy}`,
		);
	}
	const sectionOverflow = await page.evaluate(
		() => getComputedStyle(document.querySelector("section")).overflow,
	);
	check(
		"hero section overflow-visible",
		sectionOverflow === "visible",
		sectionOverflow,
	);

	/* Navbar */
	const logoImg = page.locator("nav img");
	check("navbar logo image present", (await logoImg.count()) === 1);
	const logoH = await logoImg.evaluate(
		(el) => el.getBoundingClientRect().height,
	);
	check("logo height is 32px", approx(logoH, 32), `${logoH}px`);
	for (const item of ["Features", "Solutions", "Plans", "Learning"]) {
		check(
			`nav item "${item}"`,
			(await page.locator("nav button", { hasText: item }).count()) === 1,
		);
	}
	const chevrons = await page.locator("nav .lucide-chevron-down").count();
	check("ChevronDown on Features + Learning", chevrons === 2, `${chevrons}`);
	const signUp = page.locator("nav button", { hasText: "Sign Up" });
	const su = await signUp.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			radius: cs.borderRadius,
			liquid: el.classList.contains("liquid-glass"),
			backdrop: cs.backdropFilter,
		};
	});
	check(
		"Sign Up is liquid-glass heroSecondary pill",
		su.liquid && su.radius === "9999px" && su.backdrop === "blur(4px)",
		JSON.stringify(su),
	);
	const divider = await page.evaluate(() => {
		const el = document.querySelector("header > div:last-child");
		const cs = getComputedStyle(el);
		return {
			h: el.getBoundingClientRect().height,
			bg: cs.backgroundImage,
			mt: cs.marginTop,
		};
	});
	check(
		"navbar divider 1px gradient, mt 3px",
		approx(divider.h, 1, 0.1) &&
			divider.bg.includes("linear-gradient") &&
			divider.mt === "3px",
		`${divider.h}px / ${divider.mt}`,
	);

	/* Headline */
	const h1 = page.locator("h1");
	await h1.waitFor();
	check(
		"headline reads Power AI",
		((await h1.textContent()) ?? "").replace(/\s+/g, " ").trim() === "Power AI",
	);
	const hs = await h1.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			fontSize: cs.fontSize,
			fontWeight: cs.fontWeight,
			lineHeight: parseFloat(cs.lineHeight),
			letterSpacing: parseFloat(cs.letterSpacing),
			fontFamily: cs.fontFamily,
		};
	});
	check("headline 220px at desktop", hs.fontSize === "220px", hs.fontSize);
	check("headline font-normal", hs.fontWeight === "400", hs.fontWeight);
	check(
		"headline leading-[1.02]",
		approx(hs.lineHeight, 224.4, 0.5),
		`${hs.lineHeight}px`,
	);
	check(
		"headline tracking -0.024em",
		approx(hs.letterSpacing, -5.28, 0.05),
		`${hs.letterSpacing}px`,
	);
	check(
		"headline font is General Sans",
		hs.fontFamily.includes("General Sans"),
		hs.fontFamily,
	);
	const ai = await page.evaluate(() => {
		const span = [...document.querySelectorAll("h1 span")].find(
			(s) => s.textContent === "AI",
		);
		const cs = getComputedStyle(span);
		return {
			clip: cs.webkitBackgroundClip || cs.backgroundClip,
			color: cs.color,
			bg: cs.backgroundImage,
		};
	});
	check(
		"AI span uses bg-clip-text + transparent",
		ai.clip === "text" && ai.color === "rgba(0, 0, 0, 0)",
		`${ai.clip} / ${ai.color}`,
	);
	check(
		"AI gradient is to-left indigo→purple→amber",
		ai.bg.includes("to left") &&
			ai.bg.includes("99, 102, 241") &&
			ai.bg.includes("168, 85, 247") &&
			ai.bg.includes("252, 211, 77"),
		ai.bg,
	);

	/* Subtitle */
	const sub = page.locator("p", {
		hasText: "The most powerful AI ever deployed",
	});
	check("subtitle present", (await sub.count()) === 1);
	const ss = await sub.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			fontSize: cs.fontSize,
			lineHeight: cs.lineHeight,
			opacity: cs.opacity,
			color: cs.color,
			maxWidth: cs.maxWidth,
		};
	});
	check(
		"subtitle text-lg leading-8 opacity-80 max-w-md",
		ss.fontSize === "18px" &&
			ss.lineHeight === "32px" &&
			ss.opacity === "0.8" &&
			ss.maxWidth === "448px",
		JSON.stringify(ss),
	);
	check(
		"subtitle uses hero-sub color",
		ss.color === "rgb(212, 210, 206)",
		ss.color,
	);

	/* CTA */
	const cta = page.locator("button", { hasText: "Schedule a Consult" });
	check("CTA present", (await cta.count()) === 1);
	const cs2 = await cta.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			pl: cs.paddingLeft,
			pt: cs.paddingTop,
			liquid: el.classList.contains("liquid-glass"),
			radius: cs.borderRadius,
		};
	});
	check(
		"CTA px-[29px] py-[24px] heroSecondary pill",
		cs2.pl === "29px" &&
			cs2.pt === "24px" &&
			cs2.liquid &&
			cs2.radius === "9999px",
		JSON.stringify(cs2),
	);

	/* Logo marquee */
	const marqueeText = page.locator("p", { hasText: "Relied on by brands" });
	check("marquee static text present", (await marqueeText.count()) === 1);
	for (const b of BRANDS) {
		const n = await page.locator("span", { hasText: b }).count();
		check(
			`brand "${b}" duplicated for seamless loop`,
			n === 2,
			`${n} instances`,
		);
	}
	const mq = await page.evaluate(() => {
		const track = document.querySelector(".animate-marquee");
		const cs = getComputedStyle(track);
		const icon = track.querySelector(".liquid-glass");
		const ir = icon.getBoundingClientRect();
		const ics = getComputedStyle(icon);
		const row = track.firstElementChild;
		return {
			name: cs.animationName,
			duration: cs.animationDuration,
			timing: cs.animationTimingFunction,
			iteration: cs.animationIterationCount,
			iconW: ir.width,
			iconH: ir.height,
			iconRadius: ics.borderRadius,
			iconBackdrop: ics.backdropFilter,
			rowGap: getComputedStyle(row).columnGap,
		};
	});
	check(
		"marquee 20s linear infinite",
		mq.name === "marquee" &&
			mq.duration === "20s" &&
			mq.timing === "linear" &&
			mq.iteration === "infinite",
		JSON.stringify(mq),
	);
	check(
		"marquee icons are 24x24 liquid-glass rounded-lg",
		approx(mq.iconW, 24) &&
			approx(mq.iconH, 24) &&
			mq.iconRadius === "8px" &&
			mq.iconBackdrop === "blur(4px)",
		`${mq.iconW}x${mq.iconH} r=${mq.iconRadius}`,
	);
	check("gap-16 between logos", mq.rowGap === "64px", mq.rowGap);
	const marqueeMoves = await page.evaluate(
		() =>
			new Promise((resolve) => {
				const track = document.querySelector(".animate-marquee");
				const first = new DOMMatrix(getComputedStyle(track).transform).e;
				setTimeout(() => {
					const second = new DOMMatrix(getComputedStyle(track).transform).e;
					resolve(second < first);
				}, 600);
			}),
	);
	check("marquee actually scrolls left", marqueeMoves === true);

	/* Layout + overflow */
	const sectionFlex = await page.evaluate(() => {
		const cs = getComputedStyle(document.querySelector("section"));
		return cs.display === "flex" && cs.flexDirection === "column";
	});
	check("section is min-h-screen flex flex-col", sectionFlex);
	const noHScroll = await page.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);
	check("no horizontal overflow at 1440px", noHScroll);

	await page.close();
}

/* ---------------- Mobile (390x844) ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await page.goto(BASE, { waitUntil: "networkidle" });
	const h1Size = await page
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontSize);
	check("mobile headline scales down", h1Size === "88px", h1Size);
	const navHidden = await page
		.locator("nav button", { hasText: "Features" })
		.evaluate((el) => getComputedStyle(el.parentElement).display);
	check("mobile center nav hidden", navHidden === "none", navHidden);
	const noHScroll = await page.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);
	check("no horizontal overflow at 390px", noHScroll);
	await page.close();
}

await browser.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
