/* BlurText — word-by-word blur-in headline, triggered at 10% visibility. */
(() => {
	const { motion } = window.Motion;

	const STEP_DURATION = 0.35;

	function BlurText({ text, className, delay = 100 }) {
		const ref = React.useRef(null);
		const [inView, setInView] = React.useState(false);

		React.useEffect(() => {
			const el = ref.current;
			if (!el) return undefined;
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						setInView(true);
						observer.unobserve(el);
					}
				},
				{ threshold: 0.1 },
			);
			observer.observe(el);
			return () => observer.disconnect();
		}, []);

		const words = text.split(" ");

		return (
			<p
				ref={ref}
				className={className}
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "center",
					rowGap: "0.1em",
				}}
			>
				{words.map((word, i) => (
					<motion.span
						key={`${word}-${i}`}
						initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
						animate={
							inView
								? {
										filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
										opacity: [0, 0.5, 1],
										y: [50, -5, 0],
									}
								: { filter: "blur(10px)", opacity: 0, y: 50 }
						}
						transition={{
							duration: STEP_DURATION * 2,
							times: [0, 0.5, 1],
							ease: "easeOut",
							delay: (i * delay) / 1000,
						}}
						/* marginRight instead of a non-breaking space:
               letter-spacing -4px eats the nbsp. */
						style={{ display: "inline-block", marginRight: "0.28em" }}
					>
						{word}
					</motion.span>
				))}
			</p>
		);
	}

	window.BlurText = BlurText;
})();
