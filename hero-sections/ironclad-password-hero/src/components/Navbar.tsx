import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export const NAV_LINKS = ["Vault", "Plans", "Install", "News", "Help"] as const;

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<>
			<header
				className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
				style={{ maxWidth: 1280, margin: "0 auto" }}
			>
				<a href="#" aria-label="Ironclad home" className="flex items-center">
					<Logo />
				</a>

				<nav className="hidden md:flex items-center gap-8">
					{NAV_LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="text-sm font-medium transition-opacity hover:opacity-70"
							style={{ color: "var(--color-text)" }}
						>
							{link}
						</a>
					))}
				</nav>

				<div className="hidden md:flex items-center gap-3">
					<button
						type="button"
						className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all hover:shadow-lg active:scale-95"
						style={{ backgroundColor: "#7342E2" }}
					>
						Start For Free
					</button>
					<button
						type="button"
						className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg active:scale-95"
						style={{ backgroundColor: "#F2F2EE", color: "var(--color-text)" }}
					>
						Sign In
					</button>
				</div>

				<button
					type="button"
					className="md:hidden flex items-center justify-center"
					style={{
						color: "var(--color-text)",
						background: "none",
						border: "none",
						padding: 0,
						cursor: "pointer",
					}}
					onClick={() => setMenuOpen((open) => !open)}
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					aria-expanded={menuOpen}
				>
					{menuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</header>

			<MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
		</>
	);
}
