import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

/**
 * Asset root. The spec lists `https://qclay.design/lovable/sixsense` here, but
 * every remote asset has been vendored under /public/qclay so the experiment is
 * fully self-contained and runs offline. Same filenames, local path.
 */
const A = "/qclay";

/* ------------------------------------------------------------------ *
 * 1. PixelGrid — canvas-based glass-tile background with a hover blob *
 * ------------------------------------------------------------------ */

const COLS = 12;
const ROWS = 16;
const TILE = 32;
const GAP = 1;
const CELL = TILE + GAP;
const TOTAL = COLS * ROWS;
const BASE_FILL_RATIO = 0.35;
const HOVER_FILL_RATIO = 0.7;
const HOVER_BASE_RADIUS = 4; // cells

const TILE_SRCS = [
	"/tiles/tile-1.svg",
	"/tiles/tile-2.svg",
	"/tiles/tile-3.svg",
	"/tiles/tile-4.svg",
	"/tiles/tile-5.svg",
];
const EMPTY_SRC = "/tiles/tile-empty.svg";

const DPR =
	typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

type Sprite = HTMLCanvasElement;

/** Module-level promise cache: every sprite is rasterized exactly once. */
let spritesPromise: Promise<{ empty: Sprite; on: Sprite[] }> | null = null;

function rasterize(src: string): Promise<Sprite> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const c = document.createElement("canvas");
			c.width = Math.round(TILE * DPR);
			c.height = Math.round(TILE * DPR);
			const ctx = c.getContext("2d");
			if (!ctx) return reject(new Error("no 2d ctx"));
			ctx.drawImage(img, 0, 0, c.width, c.height);
			resolve(c);
		};
		img.onerror = reject;
		img.src = src;
	});
}

function loadSprites() {
	if (!spritesPromise) {
		spritesPromise = Promise.all([
			rasterize(EMPTY_SRC),
			...TILE_SRCS.map(rasterize),
		]).then(([empty, ...on]) => ({ empty, on }));
	}
	return spritesPromise;
}

function shuffle<T>(arr: T[]): T[] {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Deterministic edge noise (stable per cell + time bucket). */
function edgeNoise(x: number, y: number, t: number) {
	const v = Math.sin(x * 12.9898 + y * 78.233 + t * 0.002);
	return (v + 1) * 0.5;
}

function PixelGrid({ side }: { side: "left" | "right" }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const spritesRef = useRef<{ empty: Sprite; on: Sprite[] } | null>(null);

	// Per-cell display state and its assigned "on" sprite variant.
	const onStateRef = useRef<Uint8Array>(new Uint8Array(TOTAL));
	const variantRef = useRef<Uint8Array>(new Uint8Array(TOTAL));
	const baseFillRef = useRef<Uint8Array>(new Uint8Array(TOTAL));
	const hoverSetRef = useRef<Set<number>>(new Set());

	const dirtyRef = useRef(true);
	const rafRef = useRef(0);
	const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
		x: 0,
		y: 0,
		active: false,
	});

	const idx = (cx: number, cy: number) => cy * COLS + cx;

	// Repaint the whole canvas only when something changed.
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		const sprites = spritesRef.current;
		if (!canvas || !sprites) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const on = onStateRef.current;
		const variant = variantRef.current;
		for (let cy = 0; cy < ROWS; cy++) {
			for (let cx = 0; cx < COLS; cx++) {
				const i = idx(cx, cy);
				const sprite = on[i] ? sprites.on[variant[i]] : sprites.empty;
				ctx.drawImage(
					sprite,
					Math.round(cx * CELL * DPR),
					Math.round(cy * CELL * DPR),
					Math.round(TILE * DPR),
					Math.round(TILE * DPR),
				);
			}
		}
	}, [idx]);

	// Single rAF render loop — repaints whenever marked dirty.
	useEffect(() => {
		const loop = () => {
			if (dirtyRef.current) {
				draw();
				dirtyRef.current = false;
			}
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	}, [draw]);

	// Load sprites + run reveal / ambient flicker.
	useEffect(() => {
		let mounted = true;
		const timers: number[] = [];

		// Assign each cell a random "on" variant + a base-fill membership.
		for (let i = 0; i < TOTAL; i++) {
			variantRef.current[i] = Math.floor(Math.random() * TILE_SRCS.length);
		}
		const order = shuffle(Array.from({ length: TOTAL }, (_, i) => i));
		const baseCount = Math.round(TOTAL * BASE_FILL_RATIO);
		baseFillRef.current.fill(0);
		for (let k = 0; k < baseCount; k++) baseFillRef.current[order[k]] = 1;

		loadSprites().then((sprites) => {
			if (!mounted) return;
			spritesRef.current = sprites;
			dirtyRef.current = true;

			if (prefersReducedMotion()) {
				// Paint final base state, no animation.
				for (let i = 0; i < TOTAL; i++)
					onStateRef.current[i] = baseFillRef.current[i];
				dirtyRef.current = true;
				return;
			}

			// Reveal: turn on base-filled cells, a chunk per rAF tick.
			const revealOrder = order.slice(0, baseCount);
			const perTick = Math.ceil(TOTAL / 18);
			let cursor = 0;
			const reveal = () => {
				if (!mounted) return;
				for (let n = 0; n < perTick && cursor < revealOrder.length; n++) {
					onStateRef.current[revealOrder[cursor++]] = 1;
				}
				dirtyRef.current = true;
				if (cursor < revealOrder.length) requestAnimationFrame(reveal);
				else startAmbient();
			};
			requestAnimationFrame(reveal);
		});

		// Ambient flicker: toggle 3 random non-hovered cells indefinitely.
		const startAmbient = () => {
			const tick = () => {
				if (!mounted) return;
				for (let n = 0; n < 3; n++) {
					const i = Math.floor(Math.random() * TOTAL);
					if (hoverSetRef.current.has(i)) continue;
					onStateRef.current[i] = Math.random() < BASE_FILL_RATIO ? 1 : 0;
				}
				dirtyRef.current = true;
				const next = 120 + Math.random() * 180;
				timers.push(window.setTimeout(tick, next));
			};
			timers.push(window.setTimeout(tick, 120 + Math.random() * 180));
		};

		return () => {
			mounted = false;
			timers.forEach(clearTimeout);
		};
	}, []);

	// Hover blob + hover flicker.
	useEffect(() => {
		if (prefersReducedMotion()) return;
		const canvas = canvasRef.current;
		if (!canvas) return;

		let raf = 0;
		let queued = false;
		const t0 = performance.now();

		const reconcile = () => {
			queued = false;
			const rect = canvas.getBoundingClientRect();
			const p = pointerRef.current;
			const localX = p.x - rect.left;
			const localY = p.y - rect.top;
			const inBounds =
				p.active &&
				localX >= -CELL * 2 &&
				localX <= rect.width + CELL * 2 &&
				localY >= -CELL * 2 &&
				localY <= rect.height + CELL * 2;

			const next = new Set<number>();
			if (inBounds) {
				const t = performance.now() - t0;
				const cx0 = localX / CELL;
				const cy0 = localY / CELL;
				for (let cy = 0; cy < ROWS; cy++) {
					for (let cx = 0; cx < COLS; cx++) {
						const dx = cx + 0.5 - cx0;
						const dy = cy + 0.5 - cy0;
						const dist = Math.hypot(dx, dy);
						if (dist > HOVER_BASE_RADIUS + 2) continue;
						const angle = Math.atan2(dy, dx);
						const n = Math.random();
						const wobble =
							Math.sin(angle * 3 + t * 0.0011) * 0.55 +
							Math.sin(angle * 5 - t * 0.0017 + 1.3) * 0.3 +
							Math.sin(angle * 2 + t * 0.0007 + 2.1) * 0.2;
						const rMax = (HOVER_BASE_RADIUS + wobble) * (0.95 + n * 0.3);
						const i = idx(cx, cy);
						if (dist <= rMax - 0.5) {
							next.add(i);
						} else if (dist <= rMax + 0.4) {
							if (edgeNoise(cx, cy, t) > 0.45) next.add(i);
						}
					}
				}
			}

			const prev = hoverSetRef.current;
			// Release cells no longer hovered: fall back to base fill.
			prev.forEach((i) => {
				if (!next.has(i)) {
					onStateRef.current[i] = baseFillRef.current[i];
				}
			});
			// Turn on newly hovered cells using the hover fill ratio.
			next.forEach((i) => {
				if (!prev.has(i)) {
					onStateRef.current[i] = Math.random() < HOVER_FILL_RATIO ? 1 : 0;
				}
			});
			hoverSetRef.current = next;
			dirtyRef.current = true;
		};

		const onMove = (e: PointerEvent) => {
			pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
			if (!queued) {
				queued = true;
				raf = requestAnimationFrame(reconcile);
			}
		};
		const onLeave = () => {
			pointerRef.current.active = false;
			if (!queued) {
				queued = true;
				raf = requestAnimationFrame(reconcile);
			}
		};

		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerleave", onLeave);

		// Hover flicker: re-randomize ~18% of hovered cells every 70–160ms.
		let flickerTimer = 0;
		const flicker = () => {
			const arr = Array.from(hoverSetRef.current);
			const count = Math.ceil(arr.length * 0.18);
			for (let n = 0; n < count; n++) {
				const i = arr[Math.floor(Math.random() * arr.length)];
				if (i === undefined) break;
				onStateRef.current[i] = Math.random() < HOVER_FILL_RATIO ? 1 : 0;
			}
			if (arr.length) dirtyRef.current = true;
			flickerTimer = window.setTimeout(flicker, 70 + Math.random() * 90);
		};
		flickerTimer = window.setTimeout(flicker, 70 + Math.random() * 90);

		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerleave", onLeave);
			cancelAnimationFrame(raf);
			clearTimeout(flickerTimer);
		};
	}, [idx]);

	const widthPx = COLS * CELL;
	const heightPx = ROWS * CELL;
	const maskAt = side === "left" ? "30% 50%" : "70% 50%";
	const mask = `radial-gradient(ellipse 80% 80% at ${maskAt}, black 0%, transparent 75%)`;

	return (
		<canvas
			ref={canvasRef}
			width={Math.round(widthPx * DPR)}
			height={Math.round(heightPx * DPR)}
			style={{
				position: "absolute",
				[side]: 0,
				top: "50%",
				transform: "translateY(-40%)",
				width: widthPx,
				height: heightPx,
				zIndex: 0,
				pointerEvents: "none",
				WebkitMaskImage: mask,
				maskImage: mask,
			}}
		/>
	);
}

/* ------------------------------------------------------------------ *
 * 4a + 4b. Folder / lights stack and the three floating cards        *
 * ------------------------------------------------------------------ */

const EASE_FOLDER: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_CARD: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FOLDER_CENTER = 113.67 / 2;

type StackItem = {
	src: string;
	bottom: number;
	left: number;
	width: number;
	height: number;
	centered?: boolean; // translateX(-50%)
	enter: {
		opacity: number[];
		y?: number[];
		duration: number;
		delay: number;
		ease: [number, number, number, number] | "easeOut";
	};
};

const STACK: StackItem[] = [
	{
		src: `${A}/blue-light-2.svg`,
		bottom: 50,
		left: 54.6,
		width: 104,
		height: 170,
		centered: true,
		enter: { opacity: [0, 1], duration: 0.8, delay: 1.0, ease: "easeOut" },
	},
	{
		src: `${A}/blue-light.svg`,
		bottom: 28,
		left: 54.6,
		width: 104,
		height: 170,
		centered: true,
		enter: { opacity: [0, 1], duration: 0.8, delay: 1.0, ease: "easeOut" },
	},
	{
		src: `${A}/light-1.svg`,
		bottom: 35,
		left: 57.2,
		width: 180.5,
		height: 124.5,
		centered: true,
		enter: { opacity: [0, 1], duration: 1.0, delay: 1.0, ease: "easeOut" },
	},
	{
		src: `${A}/folder-3.svg`,
		bottom: 60,
		left: 23.4,
		width: 69.71,
		height: 45,
		enter: {
			opacity: [0, 1],
			y: [30, 0],
			duration: 0.6,
			delay: 0.8,
			ease: EASE_FOLDER,
		},
	},
	{
		src: `${A}/small-light-2.svg`,
		bottom: 55,
		left: 67.6,
		width: 39,
		height: 17,
		centered: true,
		enter: { opacity: [0, 1], duration: 0.6, delay: 1.4, ease: "easeOut" },
	},
	{
		src: `${A}/small-light.svg`,
		bottom: 50,
		left: 44.2,
		width: 39,
		height: 25,
		centered: true,
		enter: { opacity: [0, 1], duration: 0.6, delay: 1.4, ease: "easeOut" },
	},
	{
		src: `${A}/folder-2.svg`,
		bottom: 45,
		left: 18.98,
		width: 79,
		height: 51,
		enter: {
			opacity: [0, 1],
			y: [30, 0],
			duration: 0.6,
			delay: 0.6,
			ease: EASE_FOLDER,
		},
	},
	{
		src: `${A}/light-2.svg`,
		bottom: 20,
		left: 57.2,
		width: 109,
		height: 162.5,
		centered: true,
		enter: { opacity: [0, 1], duration: 1.0, delay: 1.1, ease: "easeOut" },
	},
	{
		src: `${A}/folder-1.svg`,
		bottom: 30,
		left: 13,
		width: 91,
		height: 58,
		enter: {
			opacity: [0, 1],
			y: [30, 0],
			duration: 0.6,
			delay: 0.4,
			ease: EASE_FOLDER,
		},
	},
	{
		src: `${A}/folder-0.svg?v=2`,
		bottom: 0,
		left: 0,
		width: 113.67,
		height: 76.5,
		enter: {
			opacity: [0, 1],
			y: [30, 0],
			duration: 0.6,
			delay: 0.0,
			ease: EASE_FOLDER,
		},
	},
];

type CardSpec = {
	src: string;
	w: number;
	h: number;
	x: number; // offset from folder center
	y: number; // bottom
	rotate: number;
	start: { x: number; y: number };
	idle: { y: number[]; rot: (r: number) => number[]; duration: number };
};

const CARDS: CardSpec[] = [
	{
		src: `${A}/image-1.png`,
		w: 88.55,
		h: 68.46,
		x: -82,
		y: 123,
		rotate: -16,
		start: { x: -5, y: 7 },
		idle: {
			y: [0, -6, 0, 4, 0],
			rot: (r) => [r, r - 2, r, r + 2, r],
			duration: 6,
		},
	},
	{
		src: `${A}/image-2.png`,
		w: 105,
		h: 87,
		x: 68,
		y: 124,
		rotate: 24,
		start: { x: 35, y: 33 },
		idle: {
			y: [0, 5, 0, -5, 0],
			rot: (r) => [r, r + 2, r, r - 2, r],
			duration: 7,
		},
	},
	{
		src: `${A}/image-3.png`,
		w: 105,
		h: 96,
		x: -4,
		y: 148,
		rotate: -4,
		start: { x: -4, y: 27 },
		idle: {
			y: [0, -4, 0, 6, 0],
			rot: (r) => [r, r - 1.5, r, r + 1.5, r],
			duration: 8,
		},
	},
];

const CARD_START_SIZE = 20;
const CARD_SHADOW = "0 16px 40px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.10)";

function FolderStack() {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<div
			style={{
				position: "relative",
				width: 113.67,
				height: 220,
				overflow: "visible",
			}}
		>
			{STACK.map((it, i) => {
				const baseTransform = it.centered ? "translateX(-50%)" : undefined;
				return (
					<motion.img
						key={i}
						src={it.src}
						alt=""
						draggable={false}
						initial={{
							opacity: 0,
							...(it.enter.y ? { y: it.enter.y[0] } : {}),
						}}
						animate={{
							opacity: 1,
							...(it.enter.y ? { y: 0 } : {}),
						}}
						transition={{
							duration: it.enter.duration,
							delay: it.enter.delay,
							ease: it.enter.ease,
						}}
						style={{
							position: "absolute",
							bottom: it.bottom,
							left: it.left,
							width: it.width,
							height: it.height,
							zIndex: i + 1,
							transform: baseTransform,
							pointerEvents: "none",
							userSelect: "none",
						}}
					/>
				);
			})}

			{CARDS.map((card, i) => {
				const isHovered = hovered === i;
				const anyHovered = hovered !== null;
				const finalLeft = FOLDER_CENTER + card.x - card.w / 2;
				const startLeft = FOLDER_CENTER + card.start.x - CARD_START_SIZE / 2;

				// Idle floating only while nothing is hovered.
				const idleAnim = anyHovered
					? { y: 0, rotate: card.rotate }
					: {
							y: card.idle.y,
							rotate: card.idle.rot(card.rotate),
						};

				return (
					<motion.div
						key={`card-${i}`}
						onHoverStart={() => setHovered(i)}
						onHoverEnd={() => setHovered((h) => (h === i ? null : h))}
						initial={{
							opacity: 0,
							width: CARD_START_SIZE,
							height: CARD_START_SIZE,
							left: startLeft,
							bottom: card.start.y,
						}}
						animate={{
							opacity: 1,
							width: card.w,
							height: card.h,
							left: finalLeft,
							bottom: card.y,
						}}
						transition={{
							duration: 1.4,
							delay: 0.6 + i * 0.25,
							ease: EASE_CARD,
						}}
						style={{
							position: "absolute",
							transformOrigin: "50% 100%",
							borderRadius: 10,
							boxShadow: CARD_SHADOW,
							overflow: "hidden",
							cursor: "pointer",
							zIndex: isHovered ? 20 : 11 + i,
						}}
					>
						{/* Inner layer carries the float / hover transforms so the
						    entrance tween (left/bottom/size) stays independent. */}
						<motion.div
							animate={{
								...idleAnim,
								scale: isHovered ? 1.08 : 1,
							}}
							transition={
								anyHovered
									? { duration: 0.4, ease: EASE_CARD }
									: {
											y: {
												duration: card.idle.duration,
												repeat: Infinity,
												ease: "easeInOut",
											},
											rotate: {
												duration: card.idle.duration,
												repeat: Infinity,
												ease: "easeInOut",
											},
											scale: { duration: 0.4, ease: EASE_CARD },
										}
							}
							style={{ width: "100%", height: "100%" }}
						>
							<img
								src={card.src}
								alt=""
								draggable={false}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									display: "block",
									userSelect: "none",
								}}
							/>
						</motion.div>
					</motion.div>
				);
			})}
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * 4e. Typewriter line                                                *
 * ------------------------------------------------------------------ */

const PHRASES = [
	"Create a finance dashboard design",
	"Branding with M letter",
	"Liquid glass effect",
	"Loader animation",
	"SaaS landing page",
];

function Typewriter() {
	const [text, setText] = useState("");
	const stateRef = useRef({ phrase: 0, char: 0, deleting: false });

	useEffect(() => {
		let timer = 0;
		const tick = () => {
			const s = stateRef.current;
			const full = PHRASES[s.phrase];

			if (!s.deleting) {
				s.char++;
				setText(full.slice(0, s.char));
				if (s.char >= full.length) {
					s.deleting = true;
					timer = window.setTimeout(tick, 1400); // pause ~2 caret blinks
					return;
				}
				timer = window.setTimeout(tick, 22 + Math.random() * 25);
			} else {
				s.char--;
				setText(full.slice(0, Math.max(0, s.char)));
				if (s.char <= 0) {
					s.deleting = false;
					s.phrase = (s.phrase + 1) % PHRASES.length;
					timer = window.setTimeout(tick, 22 + Math.random() * 25);
					return;
				}
				timer = window.setTimeout(tick, 14);
			}
		};
		timer = window.setTimeout(tick, 400);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			style={{
				height: 32,
				fontSize: 15,
				lineHeight: "22px",
				fontWeight: 400,
				color: "#0D1B4B",
				paddingBottom: 10,
				display: "flex",
				alignItems: "center",
			}}
		>
			<span style={{ whiteSpace: "pre" }}>{text}</span>
			<span
				style={{
					display: "inline-block",
					width: 2,
					height: 18,
					background: "#0D1B4B",
					marginLeft: 2,
					animation: "promptCaretBlink 1s steps(1) infinite",
				}}
			/>
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * 4f. SendButton                                                     *
 * ------------------------------------------------------------------ */

function SendButton() {
	const [hovered, setHovered] = useState(false);
	const [arrowToggle, setArrowToggle] = useState(0);
	const ringRef = useRef<HTMLDivElement>(null);

	// Eased spinning ring driven by rAF.
	useEffect(() => {
		let raf = 0;
		let last = performance.now();
		let angle = 0;
		let speed = 0; // deg per ms

		const TARGET_HOVER = 360 / 1500; // deg/ms
		const loop = (now: number) => {
			const dt = Math.min(now - last, 64);
			last = now;
			const target = hovered ? TARGET_HOVER : 0;
			const tau = hovered ? 250 : 700;
			const k = 1 - Math.exp(-dt / tau);
			speed += (target - speed) * k;
			angle = (angle + speed * dt) % 360;
			if (ringRef.current) {
				ringRef.current.style.transform = `rotate(${angle}deg)`;
			}
			// Keep looping while spinning or still easing toward a non-zero
			// target; otherwise the loop settles and stops.
			if (speed >= 0.0005 || target > 0) {
				raf = requestAnimationFrame(loop);
			}
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [hovered]);

	const ringMask =
		"linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

	return (
		<motion.div
			onHoverStart={() => {
				setHovered(true);
				setArrowToggle((n) => n + 1);
			}}
			onHoverEnd={() => setHovered(false)}
			animate={{ scale: hovered ? 1.05 : 1 }}
			transition={{ duration: 0.2 }}
			style={{
				position: "relative",
				width: 44,
				height: 44,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				transform: "translateY(10%)",
			}}
		>
			{/* Outer halo */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					borderRadius: 15,
					background: "rgba(151,195,255,0.15)",
					zIndex: 1,
				}}
			/>

			{/* Inner gradient square */}
			<div
				style={{
					position: "relative",
					width: 36,
					height: 36,
					borderRadius: 12,
					background: "linear-gradient(180deg, #70A8F2 0%, #3D82DE 100%)",
					padding: 8,
					overflow: "hidden",
					zIndex: 2,
					boxShadow:
						"inset 0 1px 18px 2px rgba(173,208,255,0.20), inset 0 1px 4px 2px rgba(222,236,255,0.80), 0 42px 107px 0 rgba(61,130,222,0.34), 0 10px 10px 0 rgba(61,130,222,0.20), 0 3.714px 4.846px 0 rgba(61,130,222,0.15)",
				}}
			>
				{/* Spinning masked ring */}
				<div
					style={{
						position: "absolute",
						inset: -1,
						borderRadius: 13,
						padding: 1,
						WebkitMask: ringMask,
						mask: ringMask,
						WebkitMaskComposite: "xor",
						maskComposite: "exclude",
						zIndex: 3,
						pointerEvents: "none",
					}}
				>
					<div
						ref={ringRef}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: 13,
							background:
								"conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, #FFFFFF 60deg, #9EC7FF 120deg, rgba(255,255,255,0) 200deg, rgba(255,255,255,0) 360deg)",
						}}
					/>
				</div>

				{/* Static fallback border */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						borderRadius: 12,
						border: "1px solid #9EC7FF",
						zIndex: 4,
						pointerEvents: "none",
					}}
				/>

				{/* Dots overlay */}
				<img
					src={`${A}/dots.svg`}
					alt=""
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						opacity: 0.7,
						zIndex: 2,
						pointerEvents: "none",
					}}
				/>

				{/* Hover shine sweep — re-mounts each hover, plays once. */}
				{arrowToggle > 0 && (
					<motion.div
						key={`blink-${arrowToggle}`}
						initial={{ x: "-120%" }}
						animate={{ x: "120%" }}
						transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
						style={{
							position: "absolute",
							inset: 0,
							zIndex: 4,
							pointerEvents: "none",
							mixBlendMode: "screen",
							background:
								"linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
						}}
					/>
				)}

				{/* Arrow swap */}
				<div
					style={{
						position: "relative",
						width: 16,
						height: 16,
						overflow: "hidden",
						zIndex: 5,
					}}
				>
					<AnimatePresence initial={false}>
						{arrowToggle > 0 && (
							<motion.img
								key={`out-${arrowToggle}`}
								src={`${A}/arrow-up.svg`}
								alt=""
								initial={{ y: 0, opacity: 1 }}
								animate={{ y: -16, opacity: 0 }}
								transition={{
									duration: 0.32,
									ease: [0.65, 0, 0.35, 1],
								}}
								style={{
									position: "absolute",
									inset: 0,
									width: 16,
									height: 16,
								}}
							/>
						)}
					</AnimatePresence>
					<motion.img
						key={`in-${arrowToggle}`}
						src={`${A}/arrow-up.svg`}
						alt="Send"
						initial={
							arrowToggle > 0 ? { y: 16, opacity: 0 } : { y: 0, opacity: 1 }
						}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
						style={{
							position: "absolute",
							inset: 0,
							width: 16,
							height: 16,
						}}
					/>
				</div>
			</div>
		</motion.div>
	);
}

/* ------------------------------------------------------------------ *
 * Small toolbar building blocks                                      *
 * ------------------------------------------------------------------ */

function IconButton({ icon }: { icon: string }) {
	return (
		<button
			type="button"
			style={{
				width: 28,
				height: 28,
				borderRadius: 6,
				border: "1px solid rgba(0,0,0,0.10)",
				background: "rgba(255,255,255,0.80)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				padding: 0,
			}}
		>
			<img src={icon} alt="" style={{ width: 14, height: 14 }} />
		</button>
	);
}

/* ------------------------------------------------------------------ *
 * Sidebar buttons                                                    *
 * ------------------------------------------------------------------ */

function SidebarButton({
	icon,
	variant,
}: {
	icon: string;
	variant: "filled" | "ghost";
}) {
	const [hover, setHover] = useState(false);
	const bg =
		variant === "filled"
			? hover
				? "rgba(255,255,255,1)"
				: "rgba(255,255,255,0.90)"
			: hover
				? "rgba(255,255,255,0.5)"
				: "transparent";
	return (
		<button
			type="button"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				width: 40,
				height: 40,
				borderRadius: 12,
				border:
					variant === "filled" ? "1px solid rgba(34,106,205,0.05)" : "none",
				background: bg,
				backdropFilter: variant === "filled" ? "blur(8px)" : undefined,
				WebkitBackdropFilter: variant === "filled" ? "blur(8px)" : undefined,
				transition: "background 0.2s",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				padding: 0,
			}}
		>
			<img src={icon} alt="" style={{ width: 18, height: 18 }} />
		</button>
	);
}

/* ------------------------------------------------------------------ *
 * Page                                                               *
 * ------------------------------------------------------------------ */

export default function Index() {
	// Avoid SSR/first-paint mismatch for DPR-dependent canvases.
	const [mounted, setMounted] = useState(false);
	useLayoutEffect(() => setMounted(true), []);

	const easeOut = useMemo(() => "easeOut" as const, []);

	return (
		<div
			style={{
				position: "relative",
				minHeight: "100vh",
				width: "100%",
				background: "#EEF1F7",
				overflow: "hidden",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: '"Inter Tight", sans-serif',
			}}
		>
			{/* 1. Pixel-grid backgrounds */}
			{mounted && (
				<>
					<PixelGrid side="left" />
					<PixelGrid side="right" />
				</>
			)}

			{/* 2. Navbar */}
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					zIndex: 50,
					background: "transparent",
					pointerEvents: "none",
				}}
			>
				<div
					style={{
						marginTop: 22,
						marginLeft: 22,
						display: "flex",
						alignItems: "center",
						gap: 6,
						width: 86.816,
						height: 16,
						pointerEvents: "auto",
					}}
				>
					<img
						src={`${A}/logo-icon.svg`}
						alt="Sixsense"
						style={{ height: 16, width: "auto" }}
					/>
					<img
						src={`${A}/logo-text.svg`}
						alt="Sixsense"
						style={{ height: 16, width: "auto" }}
					/>
				</div>
			</nav>

			{/* 3. Left sidebar */}
			<div
				style={{
					position: "fixed",
					left: 16,
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 10,
					display: "flex",
					flexDirection: "column",
					gap: 8,
				}}
			>
				<SidebarButton icon={`${A}/chat.svg`} variant="filled" />
				<SidebarButton icon={`${A}/search.svg`} variant="ghost" />
			</div>

			{/* 4. Main column */}
			<main
				style={{
					position: "relative",
					zIndex: 5,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					paddingTop: 60,
					maxWidth: 760,
					width: "100%",
				}}
			>
				{/* 4a + 4b */}
				<FolderStack />

				{/* 4c. Heading */}
				<motion.h1
					initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 32,
						fontWeight: 400,
						lineHeight: "32px",
						letterSpacing: "-0.64px",
						color: "#11315D",
						width: 385,
						maxWidth: "100%",
						margin: "32px auto 8px",
						textAlign: "center",
					}}
				>
					Let's find the right references for your work
				</motion.h1>

				{/* 4d. Subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.45, ease: easeOut }}
					style={{
						fontSize: 14,
						fontWeight: 400,
						color: "rgba(13,27,75,0.50)",
						textAlign: "center",
						marginBottom: 20,
						marginTop: 0,
					}}
				>
					What type of references are you looking for?
				</motion.p>

				{/* 4e. Prompt input box */}
				<motion.div
					initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.6, delay: 0.55, ease: easeOut }}
					style={{
						width: 702,
						maxWidth: "100%",
						margin: "0 auto",
						padding: 4,
						borderRadius: 24,
						border: "0.5px solid rgba(0,0,0,0.05)",
						background: "rgba(157,196,250,0.15)",
						backdropFilter: "blur(50px)",
						WebkitBackdropFilter: "blur(50px)",
					}}
				>
					<div
						style={{
							width: "100%",
							height: 116,
							background: "#fff",
							borderRadius: 20,
							border: "1px solid rgba(34,106,205,0.05)",
							padding: "14px 14px 12px 16px",
							display: "flex",
							flexDirection: "column",
							boxSizing: "border-box",
						}}
					>
						<Typewriter />

						{/* Bottom toolbar */}
						<div
							style={{
								marginTop: 5,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							{/* Left cluster */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 6,
									transform: "translateY(35%)",
								}}
							>
								{/* Top Expert pill */}
								<div
									style={{
										width: 110,
										height: 28,
										background: "#E8F1FF",
										borderRadius: 8,
										padding: "0 8px",
										display: "flex",
										alignItems: "center",
										gap: 6,
										boxSizing: "border-box",
									}}
								>
									<div
										style={{
											width: 14,
											height: 14,
											borderRadius: 4,
											background:
												"linear-gradient(166deg, #A0E4FF 9.8%, #9CA4FB 184.41%)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										<img
											src={`${A}/ai-select.svg`}
											alt=""
											style={{ width: 8, height: 8 }}
										/>
									</div>
									<span
										style={{
											fontSize: 12,
											lineHeight: "16px",
											color: "#5085CE",
											whiteSpace: "nowrap",
										}}
									>
										Top Expert
									</span>
									<ChevronDown
										size={12}
										color="#5085CE"
										style={{ flexShrink: 0 }}
									/>
								</div>

								<IconButton icon={`${A}/image.svg`} />
								<IconButton icon={`${A}/Capa_1.svg`} />

								{/* Vertical divider */}
								<div
									style={{
										width: 1,
										height: 18,
										background: "rgba(0,0,0,0.12)",
										margin: "0 2px",
									}}
								/>

								{/* Ghost + button */}
								<button
									type="button"
									style={{
										width: 28,
										height: 28,
										borderRadius: 6,
										border: "1px solid rgba(0,0,0,0.10)",
										background: "transparent",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										padding: 0,
									}}
								>
									<Plus size={16} color="rgba(0,0,0,0.40)" />
								</button>

								{/* UI Design tag pill */}
								<div
									style={{
										height: 28,
										background: "rgba(0,0,0,0.05)",
										borderRadius: 6,
										padding: "0 8px",
										display: "flex",
										alignItems: "center",
										gap: 4,
										boxSizing: "border-box",
									}}
								>
									<span
										style={{
											fontSize: 12,
											color: "rgba(13,27,75,0.65)",
											whiteSpace: "nowrap",
										}}
									>
										UI Design
									</span>
									<span
										style={{
											fontSize: 12,
											color: "rgba(0,0,0,0.35)",
											marginLeft: 2,
											cursor: "pointer",
										}}
									>
										×
									</span>
								</div>
							</div>

							{/* Right: send button */}
							<SendButton />
						</div>
					</div>
				</motion.div>
			</main>

			{/* 5. Footer */}
			<footer
				style={{
					position: "fixed",
					bottom: 20,
					left: 0,
					width: "100%",
					zIndex: 5,
					textAlign: "center",
					fontSize: 13,
					fontWeight: 400,
					color: "rgba(13,27,75,0.45)",
					padding: "0 16px",
					boxSizing: "border-box",
				}}
			>
				By sending a message to ChatBot, you agree to our{" "}
				<span
					style={{
						color: "rgba(13,27,75,0.65)",
						textDecoration: "underline",
						textUnderlineOffset: 2,
						cursor: "pointer",
					}}
				>
					Terms
				</span>{" "}
				and have read our{" "}
				<span
					style={{
						color: "rgba(13,27,75,0.65)",
						textDecoration: "underline",
						textUnderlineOffset: 2,
						cursor: "pointer",
					}}
				>
					Privacy Policy.
				</span>
			</footer>
		</div>
	);
}
