import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const NAV_ITEMS = [
	{ label: "Home", hasChevron: false },
	{ label: "Services", hasChevron: true },
	{ label: "Reviews", hasChevron: false },
	{ label: "Contact us", hasChevron: false },
];

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	// Lock body scroll while the mobile overlay is open
	useEffect(() => {
		document.body.style.overflow = menuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [menuOpen]);

	return (
		<header className="relative z-20 w-full bg-transparent">
			<div className="animate-fade flex w-full items-center px-6 py-[16px] lg:px-[120px]">
				<Logo />

				{/* Center-left navigation — desktop only */}
				<nav
					className="ml-12 hidden items-center gap-8 lg:flex"
					aria-label="Primary"
				>
					{NAV_ITEMS.map((item) => (
						<a
							key={item.label}
							href="#"
							className="flex items-center gap-1 font-manrope text-[14px] font-medium text-white transition-opacity hover:opacity-80"
						>
							{item.label}
							{item.hasChevron && (
								<ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
							)}
						</a>
					))}
				</nav>

				{/* Action buttons — desktop only */}
				<div className="ml-auto hidden items-center gap-3 lg:flex">
					<button
						type="button"
						className="rounded-[8px] border border-[#d4d4d4] bg-white px-4 py-2 font-manrope text-[14px] font-semibold text-[#171717] transition-colors hover:bg-[#f1f1f1]"
					>
						Sign In
					</button>
					<button
						type="button"
						className="rounded-[8px] bg-primary px-4 py-2 font-manrope text-[14px] font-semibold text-[#fafafa] shadow-[0_4px_16px_rgba(123,57,252,0.4)] transition-colors hover:bg-primary-light"
					>
						Get Started
					</button>
				</div>

				{/* Hamburger — mobile only */}
				<button
					type="button"
					aria-label="Open menu"
					onClick={() => setMenuOpen(true)}
					className="ml-auto text-white transition-opacity hover:opacity-80 lg:hidden"
				>
					<Menu size={26} />
				</button>
			</div>

			{/* Full-screen mobile overlay menu */}
			{menuOpen && (
				<div className="animate-fade fixed inset-0 z-50 flex flex-col bg-black lg:hidden">
					<div className="flex items-center justify-between px-6 py-[16px]">
						<Logo />
						<button
							type="button"
							aria-label="Close menu"
							onClick={() => setMenuOpen(false)}
							className="text-white transition-opacity hover:opacity-80"
						>
							<X size={26} />
						</button>
					</div>

					<nav className="mt-10 flex flex-col gap-2 px-6" aria-label="Mobile">
						{NAV_ITEMS.map((item, i) => (
							<a
								key={item.label}
								href="#"
								onClick={() => setMenuOpen(false)}
								className="animate-rise flex items-center justify-between border-b border-white/10 py-4 font-manrope text-2xl font-medium text-white transition-opacity hover:opacity-80"
								style={{ animationDelay: `${80 + i * 60}ms` }}
							>
								{item.label}
								{item.hasChevron && (
									<ChevronDown size={22} aria-hidden="true" />
								)}
							</a>
						))}
					</nav>

					<div
						className="animate-rise mt-auto flex flex-col gap-3 px-6 pb-10"
						style={{ animationDelay: "360ms" }}
					>
						<button
							type="button"
							className="w-full rounded-[8px] border border-[#d4d4d4] bg-white py-3.5 font-manrope text-[14px] font-semibold text-[#171717] transition-colors hover:bg-[#f1f1f1]"
						>
							Sign In
						</button>
						<button
							type="button"
							className="w-full rounded-[8px] bg-primary py-3.5 font-manrope text-[14px] font-semibold text-[#fafafa] shadow-[0_4px_16px_rgba(123,57,252,0.4)] transition-colors hover:bg-primary-light"
						>
							Get Started
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
