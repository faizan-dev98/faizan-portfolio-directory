import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const LINKS = ["PROJECTS", "BLOG", "ABOUT", "RESUME"];

export default function Header() {
	const [open, setOpen] = useState(false);

	/* Lock page scroll while the mobile overlay is open. */
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<header className="absolute inset-x-0 top-0 z-40">
			<div className="flex items-center justify-between px-6 py-6 md:px-10">
				<Logo />

				{/* Desktop menu */}
				<nav
					aria-label="Primary"
					className="hidden items-center gap-10 md:flex"
				>
					{LINKS.map((link) => (
						<a
							key={link}
							href={`#${link.toLowerCase()}`}
							className="font-sans text-base text-white/80 transition-colors duration-200 hover:text-mint"
						>
							{link}
						</a>
					))}
				</nav>

				{/* Mobile hamburger */}
				<button
					type="button"
					aria-label="Open menu"
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() => setOpen(true)}
					className="text-white transition-colors duration-200 hover:text-mint md:hidden"
				>
					<Menu size={26} strokeWidth={2} />
				</button>
			</div>

			{/* Mobile full-screen overlay */}
			{open && (
				<div
					id="mobile-menu"
					className="fixed inset-0 z-[70] flex flex-col bg-ink/[0.98] backdrop-blur-md md:hidden"
				>
					<div className="flex items-center justify-between px-6 py-6">
						<Logo />
						<button
							type="button"
							aria-label="Close menu"
							onClick={() => setOpen(false)}
							className="text-white transition-colors duration-200 hover:text-mint"
						>
							<X size={26} strokeWidth={2} />
						</button>
					</div>

					<nav
						aria-label="Mobile"
						className="flex flex-1 flex-col items-start justify-center gap-7 px-8"
					>
						{LINKS.map((link, i) => (
							<a
								key={link}
								href={`#${link.toLowerCase()}`}
								onClick={() => setOpen(false)}
								className="reveal group flex items-baseline gap-4"
								style={{ animationDelay: `${0.08 * i + 0.05}s` }}
							>
								<span className="font-serif text-base italic text-mint">
									0{i + 1}
								</span>
								<span className="font-jakarta text-4xl font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-mint">
									{link}
								</span>
							</a>
						))}
					</nav>

					<div className="flex items-center justify-between px-8 pb-10 font-jakarta text-[10px] font-bold tracking-[0.28em] text-white/35">
						<span>[ CODENEST — 2025 ]</span>
						<span className="text-mint">CAREER-READY</span>
					</div>
				</div>
			)}
		</header>
	);
}
