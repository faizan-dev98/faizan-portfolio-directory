/* Capabilities — min-h-screen section: full-bleed crossfading video,
   oversized serif heading, three liquid-glass feature cards. */
(() => {
	const { motion } = window.Motion;
	const { FadingVideo, MaterialIcon } = window;

	const CAPABILITIES_VIDEO =
		"assets/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4";

	const ICON_PATHS = {
		image:
			"M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z",
		movie:
			"M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z",
		lightbulb:
			"M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z",
	};

	const CARDS = [
		{
			icon: ICON_PATHS.image,
			tags: [
				"Natural Context",
				"Photo Realism",
				"Infinite Settings",
				"Eco-Vibe",
			],
			title: "AI Scenery",
			body: "AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.",
		},
		{
			icon: ICON_PATHS.movie,
			tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"],
			title: "Batch Production",
			body: "Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.",
		},
		{
			icon: ICON_PATHS.lightbulb,
			tags: [
				"Ray Tracing",
				"Physical Shadows",
				"Studio Quality",
				"Sunlight Sync",
			],
			title: "Smart Lighting",
			body: "Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.",
		},
	];

	const HIDDEN = { filter: "blur(10px)", opacity: 0, y: 20 };
	const VISIBLE = { filter: "blur(0px)", opacity: 1, y: 0 };

	const reveal = (delay) => ({
		initial: HIDDEN,
		whileInView: VISIBLE,
		viewport: { once: true, amount: 0.2 },
		transition: { duration: 0.8, delay, ease: "easeOut" },
	});

	function Capabilities() {
		return (
			<section className="relative min-h-screen overflow-hidden bg-black">
				{/* Background video — full bleed */}
				<FadingVideo
					src={CAPABILITIES_VIDEO}
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>

				<div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
					{/* Header */}
					<div className="mb-auto">
						<motion.p
							{...reveal(0)}
							className="text-sm font-body text-white/80 mb-6"
						>
							{"// Capabilities"}
						</motion.p>
						<motion.h2
							{...reveal(0.15)}
							className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
						>
							Production
							<br />
							evolved
						</motion.h2>
					</div>

					{/* Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
						{CARDS.map((card, i) => (
							<motion.div
								key={card.title}
								{...reveal(0.2 + i * 0.15)}
								className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
							>
								{/* Top row: icon + tags */}
								<div className="flex items-start justify-between gap-4">
									<div className="liquid-glass rounded-[0.75rem] w-11 h-11 flex items-center justify-center shrink-0">
										<MaterialIcon
											d={card.icon}
											className="h-6 w-6 text-white"
										/>
									</div>
									<div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
										{card.tags.map((tag) => (
											<span
												key={tag}
												className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
											>
												{tag}
											</span>
										))}
									</div>
								</div>

								{/* Spacer */}
								<div className="flex-1" />

								{/* Bottom: title + body */}
								<div className="mt-6">
									<h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
										{card.title}
									</h3>
									<p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
										{card.body}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		);
	}

	window.Capabilities = Capabilities;
})();
