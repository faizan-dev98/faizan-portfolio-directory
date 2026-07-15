import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	Menu,
	Play,
	Search,
	Star,
	User,
	X,
} from "lucide-react";
import { useState } from "react";

const VIDEO_SRC =
	"/assets/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";

const NAV_LINKS = [
	"Movies",
	"TV Series",
	"Editor's Pick",
	"Interviews",
	"User Reviews",
];

export default function App() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden bg-black text-white">
			{/* ---- Background video (z-0) ---- */}
			<video
				className="fixed inset-0 z-0 h-full w-full object-cover"
				src={VIDEO_SRC}
				autoPlay
				muted
				loop
				playsInline
				preload="auto"
				tabIndex={-1}
				aria-hidden="true"
			/>

			{/* ---- Bottom blur veil (z-1): masked backdrop blur, no darkening ---- */}
			<div
				className="bottom-blur-mask pointer-events-none fixed inset-0 z-[1] backdrop-blur-xl"
				aria-hidden="true"
			/>

			{/* ---- Navbar (z-50) ---- */}
			<header className="relative z-50 flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6">
				<a
					href="#"
					className="animate-blur-fade-up flex h-8 items-center md:h-10"
					style={{ animationDelay: "0ms" }}
					aria-label="LUMIÈRE — home"
				>
					<span className="text-lg font-light leading-none tracking-[0.35em] md:text-xl">
						LUMI<span className="font-semibold">È</span>RE
					</span>
				</a>

				<nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
					{NAV_LINKS.map((label, i) => (
						<a
							key={label}
							href="#"
							className="animate-blur-fade-up text-sm transition-colors hover:text-gray-300"
							style={{ animationDelay: `${100 + i * 50}ms` }}
						>
							{label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<button
						type="button"
						className="liquid-glass animate-blur-fade-up hidden items-center gap-2 rounded-full px-4 py-2 text-sm sm:flex md:px-6"
						style={{ animationDelay: "350ms" }}
					>
						<Search size={18} aria-hidden="true" />
						<span>Search</span>
					</button>

					<button
						type="button"
						className="liquid-glass animate-blur-fade-up hidden h-10 w-10 items-center justify-center rounded-full sm:flex"
						style={{ animationDelay: "400ms" }}
						aria-label="Your profile"
					>
						<User size={18} aria-hidden="true" />
					</button>

					<button
						type="button"
						className="liquid-glass animate-blur-fade-up flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
						style={{ animationDelay: "350ms" }}
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						aria-expanded={menuOpen}
						aria-controls="mobile-menu"
						onClick={() => setMenuOpen((open) => !open)}
					>
						<Menu
							size={18}
							aria-hidden="true"
							className={`absolute transition-all duration-500 ease-out ${
								menuOpen
									? "rotate-180 scale-50 opacity-0"
									: "rotate-0 scale-100 opacity-100"
							}`}
						/>
						<X
							size={18}
							aria-hidden="true"
							className={`absolute transition-all duration-500 ease-out ${
								menuOpen
									? "rotate-0 scale-100 opacity-100"
									: "-rotate-180 scale-50 opacity-0"
							}`}
						/>
					</button>
				</div>
			</header>

			{/* ---- Mobile menu (z-40, below lg) ---- */}
			<div
				id="mobile-menu"
				className={`absolute inset-x-0 top-[72px] z-40 border-t border-b border-gray-800 bg-gray-900/95 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-out lg:hidden ${
					menuOpen
						? "translate-y-0 opacity-100"
						: "pointer-events-none -translate-y-4 opacity-0"
				}`}
			>
				<nav
					className="flex flex-col gap-1 px-4 py-4 sm:px-6"
					aria-label="Mobile"
				>
					{NAV_LINKS.map((label, i) => (
						<a
							key={label}
							href="#"
							tabIndex={menuOpen ? 0 : -1}
							onClick={() => setMenuOpen(false)}
							className={`rounded-lg px-3 py-3 text-sm transition-all duration-500 ease-out hover:bg-gray-800/50 ${
								menuOpen
									? "translate-x-0 opacity-100"
									: "-translate-x-4 opacity-0"
							}`}
							style={{ transitionDelay: menuOpen ? `${i * 50}ms` : "0ms" }}
						>
							{label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-3 border-t border-gray-800 px-4 py-4 sm:hidden">
					<button
						type="button"
						className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm"
					>
						<Search size={18} aria-hidden="true" />
						<span>Search</span>
					</button>
					<button
						type="button"
						className="liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
						aria-label="Your profile"
					>
						<User size={18} aria-hidden="true" />
					</button>
				</div>
			</div>

			{/* ---- Hero content (z-10, pinned to the bottom) ---- */}
			<main className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 sm:px-6 md:px-12 md:pb-16">
				<div className="flex flex-col items-end gap-8 md:flex-row">
					{/* Left: metadata, title, description, CTAs */}
					<div className="w-full flex-1">
						<div
							className="animate-blur-fade-up mb-6 flex flex-wrap items-center gap-3 text-xs sm:gap-6 sm:text-sm md:mb-8"
							style={{ animationDelay: "300ms" }}
						>
							<span className="flex items-center gap-2 font-medium">
								<Star
									size={16}
									className="fill-white sm:h-5 sm:w-5"
									aria-hidden="true"
								/>
								8.7/10 IMDB
							</span>
							<span className="flex items-center gap-2">
								<Clock size={16} aria-hidden="true" />
								132 min
							</span>
							<span className="flex items-center gap-2">
								<Calendar size={16} aria-hidden="true" />
								April, 2025
							</span>
						</div>

						<h1
							className="animate-blur-fade-up mb-4 text-3xl font-normal tracking-[-0.04em] sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl"
							style={{ animationDelay: "400ms" }}
						>
							Step Through. Work Smarter.
						</h1>

						<p
							className="animate-blur-fade-up mb-6 max-w-2xl text-base text-gray-400 sm:text-lg md:mb-12 md:text-xl"
							style={{ animationDelay: "500ms" }}
						>
							A voyage through forgotten realms, where past and future
							intertwine.
						</p>

						<div className="flex flex-wrap gap-3 sm:gap-4">
							<button
								type="button"
								className="animate-blur-fade-up flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-medium text-black transition-colors hover:bg-gray-200 sm:px-8 sm:py-3"
								style={{ animationDelay: "600ms" }}
							>
								<Play size={18} className="fill-black" aria-hidden="true" />
								Watch Now
							</button>
							<button
								type="button"
								className="liquid-glass animate-blur-fade-up rounded-full px-6 py-2.5 font-medium sm:px-8 sm:py-3"
								style={{ animationDelay: "700ms" }}
							>
								Learn More
							</button>
						</div>
					</div>

					{/* Right: previous / next pills */}
					<div className="flex w-full items-center gap-3 sm:gap-4 md:w-auto md:justify-end">
						<button
							type="button"
							className="liquid-glass animate-blur-fade-up flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm sm:px-6 sm:py-3"
							style={{ animationDelay: "800ms" }}
						>
							<ChevronLeft size={18} aria-hidden="true" />
							Previous
						</button>
						<button
							type="button"
							className="liquid-glass animate-blur-fade-up flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm sm:px-6 sm:py-3"
							style={{ animationDelay: "900ms" }}
						>
							Next
							<ChevronRight size={18} aria-hidden="true" />
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
