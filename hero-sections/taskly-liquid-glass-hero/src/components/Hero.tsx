import type { CSSProperties } from "react";
import GlassyOrb from "./GlassyOrb";

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

function Star() {
	return (
		<svg
			data-star
			width="15"
			height="15"
			viewBox="0 0 20 20"
			fill="#FF801E"
			aria-hidden="true"
		>
			<path d="M10 1.5l2.47 5.46 5.95.63-4.44 4.02 1.24 5.86L10 14.5l-5.22 2.97 1.24-5.86-4.44-4.02 5.95-.63L10 1.5z" />
		</svg>
	);
}

export default function Hero() {
	return (
		<section className="grid grid-cols-1 items-center gap-8 pt-14 sm:pt-20 lg:grid-cols-2 lg:gap-4 lg:pt-8">
			{/* ---------- Hero left ---------- */}
			<div className="pt-2 lg:py-24">
				{/* Social proof badge */}
				<div
					data-badge
					style={delay(0.05)}
					className="reveal flex w-fit items-center gap-2.5 rounded-full border border-black/5 bg-white/60 py-2 pl-3.5 pr-4 backdrop-blur-[20px] [box-shadow:inset_0px_2px_3px_0px_rgba(255,255,255,0.6),0_10px_30px_-14px_rgba(13,42,89,0.25)]"
				>
					<span className="flex items-center gap-[3px]">
						<Star />
						<Star />
						<Star />
						<Star />
						<Star />
					</span>
					<span className="text-[14px] font-medium tracking-[-0.2px] text-slate-700">
						Rated{" "}
						<strong className="font-semibold text-[#0B1526]">4.9/5</strong> by
						2700+ customers
					</span>
				</div>

				{/* Headline */}
				<h1
					style={delay(0.15)}
					className="reveal mt-7 font-fustat text-[clamp(44px,7vw,64px)] font-bold leading-[1.05] tracking-[-2px] text-[#0B1526] xl:text-[75px]"
				>
					Work smarter,
					<br />
					<span className="bg-gradient-to-r from-[#0084FF] via-[#319AFF] to-[#60B1FF] bg-clip-text text-transparent">
						achieve faster
					</span>
				</h1>

				{/* Subheadline */}
				<p
					data-subheadline
					style={delay(0.25)}
					className="reveal mt-6 max-w-[560px] font-inter text-[18px] leading-[1.65] tracking-[-1px] text-slate-600"
				>
					Effortlessly manage your projects, collaborate with your team, and
					achieve your goals with our intuitive task management tool.
				</p>

				{/* Primary CTA */}
				<div style={delay(0.35)} className="reveal mt-9">
					<button
						type="button"
						data-cta
						className="group flex items-center gap-3.5 rounded-[16px] bg-[rgba(0,132,255,0.8)] py-2.5 pl-7 pr-2.5 font-inter text-[17px] font-semibold text-white backdrop-blur-[2px] transition-transform duration-300 ease-out [box-shadow:inset_0px_4px_4px_0px_rgba(255,255,255,0.35),0_22px_45px_-18px_rgba(0,132,255,0.7)] hover:scale-[1.02]"
					>
						Get Started Now
						<span
							data-cta-arrow
							className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0084FF]"
						>
							<svg
								width="17"
								height="17"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.6"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
								className="transition-transform duration-300 group-hover:translate-x-0.5"
							>
								<path d="M5 12h14" />
								<path d="m13 6 6 6-6 6" />
							</svg>
						</span>
					</button>
				</div>
			</div>

			{/* ---------- Hero right: the glassy orb ---------- */}
			<div style={delay(0.3)} className="reveal">
				<GlassyOrb />
			</div>
		</section>
	);
}
