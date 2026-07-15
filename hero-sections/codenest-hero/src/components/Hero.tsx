import { ArrowRight } from "lucide-react";
import BackgroundVideo from "./BackgroundVideo";
import GlassCard from "./GlassCard";

export default function Hero() {
	return (
		<section
			id="top"
			className="relative flex min-h-screen flex-col overflow-hidden"
		>
			{/* ----- Background layers ----- */}
			<BackgroundVideo />

			{/* Left dark gradient: #070b0a -> transparent */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent"
			/>
			{/* Bottom-up gradient for readability */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"
			/>

			{/* Central cyan / dark-green glow */}
			<svg
				data-testid="central-glow"
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4"
				width="960"
				height="480"
				viewBox="0 0 960 480"
				fill="none"
			>
				<defs>
					<filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur in="SourceGraphic" stdDeviation="25" />
					</filter>
				</defs>
				<ellipse
					cx="480"
					cy="225"
					rx="380"
					ry="120"
					fill="#11362a"
					filter="url(#glow-blur)"
				/>
				<ellipse
					cx="480"
					cy="215"
					rx="245"
					ry="74"
					fill="#1d5f49"
					opacity="0.8"
					filter="url(#glow-blur)"
				/>
				<ellipse
					cx="480"
					cy="208"
					rx="132"
					ry="42"
					fill="#2dd4bf"
					opacity="0.4"
					filter="url(#glow-blur)"
				/>
			</svg>

			{/* Vertical grid lines at 25 / 50 / 75% (desktop only) */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 hidden md:block"
			>
				{[25, 50, 75].map((mark) => (
					<div
						key={mark}
						data-testid="grid-line"
						className="absolute inset-y-0 w-px bg-white/10"
						style={{ left: `${mark}%` }}
					/>
				))}
			</div>

			{/* ----- Hero content ----- */}
			<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-40 text-center md:pt-44">
				<GlassCard />

				<p
					className="reveal font-jakarta text-[11px] font-bold uppercase tracking-[0.32em] text-mint"
					style={{ animationDelay: "0.25s" }}
				>
					Career-Ready Curriculum
				</p>

				<h1
					className="reveal mt-5 font-sans text-[40px] font-extrabold uppercase leading-[1.02] tracking-tight text-white md:text-[56px] lg:text-[72px]"
					style={{ animationDelay: "0.38s" }}
				>
					LAUNCH YOUR <br />
					CODING CAREER<span className="text-mint">.</span>
				</h1>

				<p
					className="reveal mx-auto mt-6 max-w-lg font-sans text-[14px] leading-relaxed text-white/70"
					style={{ animationDelay: "0.52s" }}
				>
					Master in-demand coding skills with project-first courses, weekly code
					reviews, and 1:1 mentorship from engineers shipping at the
					world&apos;s best companies.
				</p>

				<button
					type="button"
					className="reveal group mt-10 inline-flex items-center gap-2.5 rounded-full bg-mint px-8 py-4 font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:bg-[#79e0ae] hover:shadow-[0_0_36px_rgba(94,210,156,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
					style={{ animationDelay: "0.66s" }}
				>
					Get Started
					<ArrowRight
						size={16}
						strokeWidth={2.5}
						className="transition-transform duration-300 group-hover:translate-x-1"
						aria-hidden="true"
					/>
				</button>
			</div>

			{/* ----- Bottom meta strip (desktop) ----- */}
			<div
				className="reveal relative z-10 hidden items-center justify-between border-t border-white/[0.06] px-10 py-5 font-jakarta text-[10px] font-bold tracking-[0.28em] text-white/35 md:flex"
				style={{ animationDelay: "0.9s" }}
			>
				<span>[ EST. 2025 ]</span>
				<span>12,400+ GRADUATES HIRED WORLDWIDE</span>
				<span className="flex items-center gap-3">
					SCROLL
					<span className="scroll-line" aria-hidden="true" />
				</span>
			</div>
		</section>
	);
}
