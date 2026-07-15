import { ChevronDown } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
	{ label: "Features", chevron: true },
	{ label: "Solutions", chevron: false },
	{ label: "Plans", chevron: false },
	{ label: "Learning", chevron: true },
] as const;

export default function Navbar() {
	return (
		<header className="relative animate-rise">
			<nav
				className="flex w-full flex-row items-center justify-between px-8 py-5"
				aria-label="Primary"
			>
				<a
					href="/"
					className="flex shrink-0 items-center"
					aria-label="Power AI home"
				>
					<img src={logo} alt="Power AI" className="h-8 w-auto" height={32} />
				</a>

				<div className="hidden items-center gap-8 md:flex">
					{NAV_ITEMS.map(({ label, chevron }) => (
						<button
							key={label}
							type="button"
							className="group flex items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors duration-200 hover:text-foreground"
						>
							{label}
							{chevron && (
								<ChevronDown
									className="h-4 w-4 opacity-60 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:opacity-100"
									aria-hidden="true"
								/>
							)}
						</button>
					))}
				</div>

				<Button variant="heroSecondary" className="rounded-full px-4 py-2">
					Sign Up
				</Button>
			</nav>

			<div className="mt-[3px] h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
		</header>
	);
}
