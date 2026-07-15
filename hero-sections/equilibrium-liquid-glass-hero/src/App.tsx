import { ChevronDown, Infinity, Menu, X } from "lucide-react";
import { useState } from "react";

const BG_VIDEO =
	"/assets/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4";

interface NavLink {
	label: string;
	active?: boolean;
	dropdown?: boolean;
}

const navLinks: NavLink[] = [
	{ label: "Home", active: true },
	{ label: "Wellness", dropdown: true },
	{ label: "Routine" },
	{ label: "Our Team" },
];

export default function App() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Background video */}
			<video
				className="absolute inset-0 w-full h-full object-cover"
				src={BG_VIDEO}
				autoPlay
				muted
				loop
				playsInline
			/>

			{/* Navbar */}
			<nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-8 py-5">
				{/* Logo */}
				<div className="flex items-center gap-2 text-white font-medium text-base">
					<Infinity size={22} strokeWidth={1.5} />
					<span>Equilibrium</span>
				</div>

				{/* Nav pill */}
				<div className="liquid-glass hidden md:flex items-center gap-1 rounded-xl px-2 py-2">
					{navLinks.map((link) => (
						<button
							key={link.label}
							className={`flex items-center gap-0.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
								link.active
									? "bg-white/15 text-white"
									: "text-white/70 hover:text-white"
							}`}
						>
							{link.label}
							{link.dropdown && <ChevronDown size={13} className="mt-px" />}
						</button>
					))}
				</div>

				{/* Desktop CTAs */}
				<div className="hidden md:flex items-center gap-3">
					<button className="liquid-glass text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/5 transition-colors">
						Log in
					</button>
					<button className="bg-white text-black text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/90 transition-colors">
						Begin Now
					</button>
				</div>

				{/* Mobile toggle */}
				<button
					className="md:hidden liquid-glass text-white p-2 rounded-lg"
					onClick={() => setMenuOpen((open) => !open)}
					aria-label={menuOpen ? "Close menu" : "Open menu"}
				>
					{menuOpen ? <X size={18} /> : <Menu size={18} />}
				</button>
			</nav>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="absolute top-[72px] left-4 right-4 z-30 md:hidden liquid-glass rounded-2xl p-4 flex flex-col gap-1">
					{navLinks.map((link) => (
						<button
							key={link.label}
							className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-colors ${
								link.active
									? "bg-white/15 text-white"
									: "text-white/70 hover:text-white"
							}`}
						>
							{link.label}
							{link.dropdown && <ChevronDown size={13} className="mt-px" />}
						</button>
					))}
					<div className="flex gap-2 mt-2 pt-3 border-t border-white/10">
						<button className="flex-1 liquid-glass text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/5 transition-colors">
							Log in
						</button>
						<button className="flex-1 bg-white text-black text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/90 transition-colors">
							Begin Now
						</button>
					</div>
				</div>
			)}

			{/* Hero content */}
			<div className="absolute bottom-0 left-0 z-20 px-6 sm:px-12 pb-10 sm:pb-16 max-w-2xl">
				<h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight tracking-tight mb-4">
					Live Better, Feel Whole Every Day
				</h1>
				<p className="text-white/60 text-sm leading-relaxed mb-7 max-w-md">
					Take charge of how you feel with a companion built for your
					journey&mdash;build routines, follow your growth, and unlock tailored
					insights for a steadier, more vibrant life each day.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<button className="bg-white text-black text-sm sm:text-base font-medium px-6 sm:px-7 py-3 rounded-full hover:bg-white/90 transition-colors">
						Start Today
					</button>
					<button className="liquid-glass text-white text-sm sm:text-base font-medium px-6 sm:px-7 py-3 rounded-full hover:bg-white/5 transition-colors">
						Discover How
					</button>
				</div>
			</div>
		</div>
	);
}
