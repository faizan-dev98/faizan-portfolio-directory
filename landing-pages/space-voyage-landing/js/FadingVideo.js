/* FadingVideo — custom JS crossfade looping video. No CSS transitions:
   every fade is rAF-driven, and looping is implemented manually via `ended`
   (the native `loop` attribute is OFF). */
(() => {
	const FADE_MS = 500;
	const FADE_OUT_LEAD = 0.55; // seconds before the end to start fading out

	function FadingVideo({ src, className, style }) {
		const videoRef = React.useRef(null);
		const rafRef = React.useRef(null);
		const fadingOutRef = React.useRef(false);

		React.useEffect(() => {
			const video = videoRef.current;
			if (!video) return undefined;

			// Reads the current opacity from video.style.opacity so each new fade
			// resumes from wherever the last one left off.
			const fadeTo = (target, duration = FADE_MS) => {
				if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
				const from = parseFloat(video.style.opacity || "0");
				const start = performance.now();
				const tick = (now) => {
					const t = Math.min((now - start) / duration, 1);
					video.style.opacity = String(from + (target - from) * t);
					if (t < 1) {
						rafRef.current = requestAnimationFrame(tick);
					} else {
						rafRef.current = null;
					}
				};
				rafRef.current = requestAnimationFrame(tick);
			};

			const onLoadedData = () => {
				video.style.opacity = "0";
				video.play().catch(() => {});
				fadeTo(1);
			};

			const onTimeUpdate = () => {
				const remaining = video.duration - video.currentTime;
				if (
					!fadingOutRef.current &&
					remaining <= FADE_OUT_LEAD &&
					remaining > 0
				) {
					fadingOutRef.current = true;
					fadeTo(0);
				}
			};

			const onEnded = () => {
				video.style.opacity = "0";
				setTimeout(() => {
					video.currentTime = 0;
					video.play().catch(() => {});
					fadingOutRef.current = false;
					fadeTo(1);
				}, 100);
			};

			video.addEventListener("loadeddata", onLoadedData);
			video.addEventListener("timeupdate", onTimeUpdate);
			video.addEventListener("ended", onEnded);

			// If the video was already buffered before listeners attached.
			if (video.readyState >= 2) onLoadedData();

			return () => {
				if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
				video.removeEventListener("loadeddata", onLoadedData);
				video.removeEventListener("timeupdate", onTimeUpdate);
				video.removeEventListener("ended", onEnded);
			};
		}, [src]);

		return (
			<video
				ref={videoRef}
				src={src}
				className={className}
				style={{ opacity: 0, ...style }}
				autoPlay
				muted
				playsInline
				preload="auto"
			/>
		);
	}

	window.FadingVideo = FadingVideo;
})();
