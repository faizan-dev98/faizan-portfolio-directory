/* Hero — full-viewport section: crossfading video, navbar, blur-in headline,
   CTAs, stat cards, partners row. */
(() => {
	const { motion } = window.Motion;
	const {
		FadingVideo,
		BlurText,
		Navbar,
		ArrowUpRight,
		PlayIcon,
		ClockIcon,
		GlobeIcon,
	} = window;

	const HERO_VIDEO =
		"assets/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";

	const HIDDEN = { filter: "blur(10px)", opacity: 0, y: 20 };
	const VISIBLE = { filter: "blur(0px)", opacity: 1, y: 0 };

	const enter = (delay) => ({
		initial: HIDDEN,
		animate: VISIBLE,
		transition: { duration: 0.8, delay, ease: "easeOut" },
	});

	const STATS = [
		{ Icon: ClockIcon, value: "34.5 Min", label: "Average Videos Watch Time" },
		{ Icon: GlobeIcon, value: "2.8B+", label: "Users Across the Globe" },
	];

	const PARTNERS = ["Aeon", "Vela", "Apex", "Orbit", "Zeno"];

	function Hero() {
		return (
			<section className="relative min-h-screen overflow-hidden bg-black">
				{/* Background video — oversized, anchored to the top of frame */}
				<FadingVideo
					src={HERO_VIDEO}
					className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
					style={{ width: "120%", height: "120%" }}
				/>

				<div className="relative z-10 flex flex-col min-h-screen">
					<Navbar />

					{/* Hero content */}
					<div className="flex-1 flex flex-col items-center justify-center text-center pt-24 px-4">
						{/* Badge */}
						<motion.div
							{...enter(0.4)}
							className="liquid-glass rounded-full flex items-center gap-3 p-1"
						>
							<span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
								New
							</span>
							<span className="text-sm text-white/90 pr-3 font-body">
								Maiden Crewed Voyage to Mars Arrives 2026
							</span>
						</motion.div>

						{/* Headline */}
						<BlurText
							text="Venture Past Our Sky Across the Universe"
							className="mt-6 text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl justify-center tracking-[-4px]"
						/>

						{/* Subheading */}
						<motion.p
							{...enter(0.8)}
							className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight"
						>
							Discover the universe in ways once unimaginable. Our pioneering
							vessels and breakthrough engineering bring deep-space exploration
							within reach&mdash;secure and extraordinary.
						</motion.p>

						{/* CTAs */}
						<motion.div
							{...enter(1.1)}
							className="flex items-center gap-6 mt-6"
						>
							<a
								href="#"
								className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white font-body flex items-center gap-2"
							>
								Start Your Voyage
								<ArrowUpRight className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="flex items-center gap-2 text-sm font-medium text-white font-body"
							>
								View Liftoff
								<PlayIcon className="h-4 w-4" />
							</a>
						</motion.div>

						{/* Stats */}
						<motion.div
							{...enter(1.3)}
							className="flex flex-wrap justify-center items-stretch gap-4 mt-8"
						>
							{STATS.map(({ Icon, value, label }) => (
								<div
									key={value}
									className="liquid-glass p-5 w-[220px] rounded-[1.25rem] flex flex-col items-start text-left"
								>
									<Icon />
									<div className="mt-auto pt-6">
										<div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">
											{value}
										</div>
										<div className="text-xs text-white font-body font-light mt-2">
											{label}
										</div>
									</div>
								</div>
							))}
						</motion.div>
					</div>

					{/* Partners */}
					<motion.div
						{...enter(1.4)}
						className="flex flex-col items-center gap-4 pb-8"
					>
						<div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body">
							Collaborating with top aerospace pioneers globally
						</div>
						<div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
							{PARTNERS.map((name) => (
								<span
									key={name}
									className="font-heading italic text-white text-2xl md:text-3xl tracking-tight"
								>
									{name}
								</span>
							))}
						</div>
					</motion.div>
				</div>
			</section>
		);
	}

	window.Hero = Hero;
})();
