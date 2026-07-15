import { Menu } from "lucide-react";
import * as React from "react";
import logoWhite from "@/assets/logo.svg";
import logoDark from "@/assets/logo-dark.svg";

const NAV_ITEMS = ["Home", "Artists", "Releases", "Contact"] as const;

export function Header() {
	// Logo swaps to the dark version once the user scrolls past the dark hero.
	const [scrolledPastHero, setScrolledPastHero] = React.useState(false);

	React.useEffect(() => {
		const onScroll = () => {
			setScrolledPastHero(window.scrollY > window.innerHeight - 80);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="fixed top-6 left-0 right-0 z-50 px-8 flex items-center justify-between">
			<img
				src={scrolledPastHero ? logoDark : logoWhite}
				alt="Pelmatech"
				className="h-8 w-auto transition-opacity"
			/>

			<nav
				className="flex items-center gap-1 backdrop-blur-md text-white rounded-full pl-2 pr-2 py-2"
				style={{ background: "var(--header-bg)" }}
			>
				{NAV_ITEMS.map((item, i) => (
					<a
						key={item}
						href="#"
						className={
							i === 0
								? "px-5 py-2 text-sm rounded-full bg-white/10 font-medium"
								: "px-5 py-2 text-sm rounded-full opacity-80 hover:opacity-100 transition"
						}
					>
						{item}
					</a>
				))}
				<button
					type="button"
					className="ml-2 flex items-center gap-2 px-4 py-2 text-sm rounded-full hover:bg-white/10 transition"
				>
					<Menu className="w-4 h-4" />
					Menu
				</button>
			</nav>
		</header>
	);
}
