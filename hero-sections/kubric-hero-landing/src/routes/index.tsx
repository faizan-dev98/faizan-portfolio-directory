import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import bodyVideo from "../assets/body.mp4?url";
import cardImage from "../assets/card-image.png?url";

export const Route = createFileRoute("/")({
	component: Home,
});

const CHAR_STEP = 0.038;

function Home() {
	const heroRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const hero = heroRef.current;
		const video = videoRef.current;
		if (!hero) return;

		let started = false;

		/**
		 * Walk every text node inside each `.hero__line-inner` matched by `selector`
		 * and wrap each character in <span class="hero__char">, giving it a staggered
		 * animationDelay. Spaces stay as plain text nodes (not wrapped) so that the
		 * inline-block chars still break correctly between words.
		 */
		function animateLines(
			selector: string,
			baseDelay: number,
			lineGap: number,
		) {
			const inners = hero?.querySelectorAll<HTMLElement>(selector);
			inners.forEach((inner, lineIndex) => {
				if (inner.dataset.split === "true") return;
				inner.dataset.split = "true";

				const lineDelay = baseDelay + lineIndex * lineGap;
				let charCount = 0;

				const textNodes: Text[] = [];
				const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT);
				let node = walker.nextNode();
				while (node) {
					textNodes.push(node as Text);
					node = walker.nextNode();
				}

				textNodes.forEach((textNode) => {
					const text = textNode.textContent ?? "";
					const frag = document.createDocumentFragment();
					for (const ch of text) {
						if (ch === " ") {
							frag.appendChild(document.createTextNode(" "));
							continue;
						}
						const span = document.createElement("span");
						span.className = "hero__char";
						span.textContent = ch;
						span.style.animationDelay = `${(lineDelay + charCount * CHAR_STEP).toFixed(3)}s`;
						frag.appendChild(span);
						charCount += 1;
					}
					textNode.parentNode?.replaceChild(frag, textNode);
				});
			});
		}

		function startAnimations() {
			if (started) return;
			started = true;
			document.body.classList.add("is-ready");
			animateLines(".hero__heading .hero__line-inner", 0.3, 0.85);
			animateLines(".hero__label .hero__line-inner", 0.3, 0.65);
			animateLines(".hero__desc .hero__line-inner", 0.3, 0.65);
		}

		// ----- video readiness drives the reveal -----
		let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
		const onCanPlayThrough = () => startAnimations();
		const onTimeUpdate = () => {
			if (video && video.currentTime >= 10) {
				video.currentTime = 0;
				video.play().catch(() => {});
			}
		};

		if (video) {
			video.play().catch(() => {});
			if (video.readyState >= 4) {
				startAnimations();
			} else {
				video.addEventListener("canplaythrough", onCanPlayThrough, {
					once: true,
				});
			}
			video.addEventListener("timeupdate", onTimeUpdate);
		}

		// Hard fallback so the page never stays hidden if the video stalls.
		fallbackTimer = setTimeout(startAnimations, 5000);

		// ----- smooth-scroll for in-page anchors -----
		const onAnchorClick = (e: MouseEvent) => {
			const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
				'a[href^="#"]',
			);
			if (!anchor) return;
			const href = anchor.getAttribute("href") ?? "";
			e.preventDefault();
			if (href === "#") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return;
			}
			const target = document.querySelector(href);
			if (target) {
				const top = target.getBoundingClientRect().top + window.scrollY;
				window.scrollTo({ top, behavior: "smooth" });
			}
		};
		document.addEventListener("click", onAnchorClick);

		// ----- scroll-down button advances one viewport -----
		const scrollDown = document.getElementById("scrollDown");
		const onScrollDown = () => {
			window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
		};
		scrollDown?.addEventListener("click", onScrollDown);

		// ----- side-nav active marker follows the clicked link -----
		const sideLinks =
			hero.querySelectorAll<HTMLAnchorElement>(".side-nav__link");
		const onSideClick = (e: Event) => {
			const link = e.currentTarget as HTMLAnchorElement;
			sideLinks.forEach((l) => {
				l.classList.remove("side-nav__link--active");
				l.querySelector(".side-nav__line")?.remove();
			});
			link.classList.add("side-nav__link--active");
			const line = document.createElement("span");
			line.className = "side-nav__line";
			link.appendChild(line);
		};
		sideLinks.forEach((l) => l.addEventListener("click", onSideClick));

		return () => {
			if (fallbackTimer) clearTimeout(fallbackTimer);
			if (video) {
				video.removeEventListener("canplaythrough", onCanPlayThrough);
				video.removeEventListener("timeupdate", onTimeUpdate);
			}
			document.removeEventListener("click", onAnchorClick);
			scrollDown?.removeEventListener("click", onScrollDown);
			sideLinks.forEach((l) => l.removeEventListener("click", onSideClick));
			document.body.classList.remove("is-ready");
		};
	}, []);

	return (
		<div className="hero" ref={heroRef}>
			<div className="hero__bg">
				<video
					className="hero__video"
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
				>
					<source src={bodyVideo} type="video/mp4" />
				</video>
			</div>
			<div className="hero__overlay" />
			<div className="hero__gradient-top" />
			<div className="hero__gradient-bottom" />

			<div className="hero__blur">
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
				<div className="hero__blur-layer" />
			</div>

			<header className="header">
				<a className="logo" href="#" aria-label="Kubric">
					<svg
						className="logo__icon"
						viewBox="0 0 122 30"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							className="logo__circle"
							cx="14.3"
							cy="14.9"
							r="7"
							fill="none"
							stroke="#fff"
							strokeWidth="3"
						/>
						<path
							className="logo__arc-1a"
							pathLength="100"
							stroke="#fff"
							strokeWidth="3"
							strokeLinecap="round"
							fill="none"
							d="M28.4955 14.6513C28.4346 12.2923 27.7563 9.99047 26.5284 7.9753C25.3005 5.96012 23.5657 4.30202 21.4972 3.1663C19.4287 2.03059 17.0985 1.45693 14.7392 1.50252C12.3798 1.54811 10.0736 2.21137 8.05047 3.42615"
						/>
						<path
							className="logo__arc-1b"
							pathLength="100"
							stroke="#fff"
							strokeWidth="3"
							strokeLinecap="round"
							fill="none"
							d="M28.4955 14.6513C28.5564 17.0104 27.998 19.3442 26.8757 21.4201C25.7535 23.496 24.1067 25.2414 22.0996 26.4824C20.0924 27.7234 17.795 28.4166 15.4365 28.4929C13.0779 28.5692 10.7405 28.026 8.65735 26.9173"
						/>
						<path
							className="logo__arc-2a"
							pathLength="100"
							stroke="#fff"
							strokeWidth="3"
							strokeLinecap="round"
							fill="none"
							d="M37.4997 14.9144C37.4824 12.1783 36.634 9.51197 35.0671 7.26888C33.5001 5.02578 31.2885 3.31178 28.7254 2.35403"
						/>
						<path
							className="logo__arc-2b"
							pathLength="100"
							stroke="#fff"
							strokeWidth="3"
							strokeLinecap="round"
							fill="none"
							d="M37.4997 14.9144C37.5171 17.6506 36.7026 20.3274 35.1642 22.5902C33.6258 24.853 31.4361 26.5949 28.8853 27.5851"
						/>
						<g className="logo__text-group">
							<text
								x="46"
								y="22"
								fontFamily="Inter Tight"
								fontSize="22"
								fontWeight="700"
								fill="#fff"
								letterSpacing="-0.5"
							>
								Kubric
							</text>
							<text className="logo__tm" x="113" y="10">
								™
							</text>
						</g>
					</svg>
				</a>

				<nav className="nav-pill" aria-label="Primary">
					<a className="nav-pill__link" href="#features">
						Features
					</a>
					<a className="nav-pill__link" href="#team">
						Team
						<span className="nav-pill__badge">3</span>
					</a>
					<a className="nav-pill__link" href="#roadmap">
						Roadmap
					</a>
					<a className="nav-pill__link" href="#contact">
						Contact
					</a>
				</nav>

				<button className="btn btn--header" type="button">
					Book a call
					<svg className="btn__arrow" viewBox="0 0 8 8" fill="none">
						<path
							d="M1 7L7 1M7 1H2M7 1V6"
							stroke="currentColor"
							strokeWidth="1"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</header>

			<h1 className="hero__heading">
				<span className="hero__line">
					<span className="hero__line-inner">Making your business</span>
				</span>
				<span className="hero__line">
					<span className="hero__line-inner">outstanding — is a</span>
				</span>
				<span className="hero__line">
					<span className="hero__line-inner">
						<em>Science</em>
					</span>
				</span>
			</h1>

			<nav className="side-nav" aria-label="Sections">
				<a className="side-nav__link side-nav__link--active" href="#home">
					<span className="side-nav__link-text">Home</span>
					<span className="side-nav__line" />
				</a>
				<a className="side-nav__link" href="#services">
					<span className="side-nav__link-text">Our Services</span>
				</a>
				<a className="side-nav__link" href="#about">
					<span className="side-nav__link-text">About Us</span>
				</a>
				<a className="side-nav__link" href="#reviews">
					<span className="side-nav__link-text">Reviews</span>
				</a>
				<a className="side-nav__link" href="#contact">
					<span className="side-nav__link-text">Contact Us</span>
				</a>
			</nav>

			<div className="hero__blur-bar" />

			<div className="hero__bottom">
				<div className="hero__label">
					<span className="hero__line-inner">01 — Our goal</span>
				</div>
				<p className="hero__desc">
					<span className="hero__line-inner">
						We enable the world&rsquo;s most engaged investors and
					</span>{" "}
					<span className="hero__line-inner">
						family offices to access professionally managed
					</span>{" "}
					<span className="hero__line-inner">investment strategies.</span>
				</p>

				<div className="hero__actions">
					<button className="btn btn--footer" type="button">
						Discuss the project
						<svg className="btn__arrow" viewBox="0 0 8 8" fill="none">
							<path
								d="M1 7L7 1M7 1H2M7 1V6"
								stroke="currentColor"
								strokeWidth="1"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					<button className="scroll-down" id="scrollDown" type="button">
						<span className="scroll-down__text">Scroll down</span>
						<span className="scroll-down__circle">
							<svg viewBox="0 0 7.222 8.667" fill="none">
								<path
									d="M3.611 1V7.667M3.611 7.667L1 5M3.611 7.667L6.222 5"
									stroke="currentColor"
									strokeWidth="1"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</button>
				</div>

				<a className="about-card" href="#about">
					<div className="about-card__image">
						<img src={cardImage} alt="Pink tulip closeup" />
					</div>
					<div className="about-card__content">
						<div>
							<h3 className="about-card__title">About us</h3>
							<p className="about-card__text">
								We&rsquo;re driven by user-centered design that drives
								productivity and increases revenue.
							</p>
						</div>
						<svg className="about-card__arrow" viewBox="0 0 77 13" fill="none">
							<path
								d="M1 6.5H75M75 6.5L70 1.5M75 6.5L70 11.5"
								stroke="currentColor"
								strokeWidth="1"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</a>
			</div>
		</div>
	);
}
