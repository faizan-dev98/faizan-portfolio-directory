import { Button } from "@/components/ui/button";

const NAV_LINKS = ["Services", "About Us", "Projects", "Team", "Contacts"];

const toAnchor = (label: string) =>
	`#${label.toLowerCase().replace(/\s+/g, "-")}`;

const Navbar = () => (
	<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
		<a
			href="#"
			className="text-foreground text-xl font-semibold tracking-tight"
		>
			SENTINEL
		</a>

		<nav className="hidden md:flex items-center gap-8">
			{NAV_LINKS.map((link) => (
				<a
					key={link}
					href={toAnchor(link)}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
				>
					{link}
				</a>
			))}
		</nav>

		<Button
			variant="navCta"
			size="lg"
			className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6"
		>
			Get Quote
		</Button>
	</header>
);

export default Navbar;
