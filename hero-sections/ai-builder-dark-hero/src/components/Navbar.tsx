import { ChevronDown } from "lucide-react";

const NAV_LINKS = ["Customer Stories", "Resources", "Pricing"];

function SunburstIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="text-white"
		>
			<circle cx="12" cy="12" r="3.5" fill="currentColor" />
			{Array.from({ length: 12 }, (_, i) => {
				const angle = (i * 30 * Math.PI) / 180;
				const x1 = 12 + Math.cos(angle) * 6;
				const y1 = 12 + Math.sin(angle) * 6;
				const x2 = 12 + Math.cos(angle) * 11;
				const y2 = 12 + Math.sin(angle) * 11;
				return (
					<line
						key={i}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
				);
			})}
		</svg>
	);
}

export default function Navbar() {
	return (
		<header className="fixed top-0 left-0 z-50 w-full bg-transparent px-6 py-4">
			<nav className="flex items-center justify-between" aria-label="Main">
				<a href="#" aria-label="Home">
					<SunburstIcon />
				</a>

				<div className="hidden items-center gap-8 md:flex">
					<a
						href="#"
						className="flex items-center gap-1 font-sans text-sm font-medium text-white/80 transition-colors hover:text-white"
					>
						Products
						<ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
					</a>
					{NAV_LINKS.map((label) => (
						<a
							key={label}
							href="#"
							className="font-sans text-sm font-medium text-white/80 transition-colors hover:text-white"
						>
							{label}
						</a>
					))}
				</div>

				<div className="flex items-center gap-6">
					<a
						href="#"
						className="hidden font-sans text-sm font-medium text-white/80 transition-colors hover:text-white sm:block"
					>
						Book A Demo
					</a>
					<a
						href="#"
						className="rounded-full bg-white px-5 py-2.5 font-sans text-sm font-semibold text-black transition-transform hover:scale-105"
					>
						Get Started
					</a>
				</div>
			</nav>
		</header>
	);
}
