const LINKS = ["Home", "Features", "Company", "Pricing"];

function ArrowIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.4"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M5 12h14" />
			<path d="m13 6 6 6-6 6" />
		</svg>
	);
}

export default function Navbar() {
	return (
		<nav
			aria-label="Primary"
			className="reveal sticky top-[30px] z-50 mx-auto flex w-fit items-center gap-1 rounded-[16px] border border-black/10 bg-white/30 py-2 pl-3 pr-2 backdrop-blur-[50px] [box-shadow:inset_0px_4px_4px_0px_rgba(255,255,255,0.25),0_18px_50px_-20px_rgba(13,42,89,0.25)]"
		>
			{/* Brand */}
			<a
				href="#"
				className="mr-2 flex items-center gap-2 pl-1 pr-2"
				aria-label="Taskly home"
			>
				<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
					<rect width="32" height="32" rx="9" fill="rgba(0,132,255,0.85)" />
					<rect width="32" height="32" rx="9" fill="url(#tasklyShine)" />
					<path
						d="M9 16.5l5 5 9-10"
						stroke="white"
						strokeWidth="3.2"
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
					/>
					<defs>
						<linearGradient
							id="tasklyShine"
							x1="0"
							y1="0"
							x2="32"
							y2="32"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stopColor="white" stopOpacity="0.45" />
							<stop offset="0.5" stopColor="white" stopOpacity="0" />
						</linearGradient>
					</defs>
				</svg>
				<span className="font-fustat text-[21px] font-bold tracking-[-0.5px] text-[#0B1526]">
					Taskly
				</span>
			</a>

			{/* Links */}
			<div className="hidden items-center md:flex">
				{LINKS.map((link) => (
					<a
						key={link}
						href="#"
						className="rounded-[10px] px-4 py-2 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:bg-white/60 hover:text-slate-950"
					>
						{link}
					</a>
				))}
			</div>

			{/* Glassy SignUp */}
			<button
				type="button"
				className="group ml-2 flex items-center gap-2 rounded-[12px] border border-black/10 bg-white/45 px-4 py-2 text-[15px] font-semibold text-[#0B1526] backdrop-blur-[10px] transition-all duration-200 [box-shadow:inset_0px_4px_4px_0px_rgba(255,255,255,0.4)] hover:bg-white/70"
			>
				SignUp
				<ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
			</button>
		</nav>
	);
}
