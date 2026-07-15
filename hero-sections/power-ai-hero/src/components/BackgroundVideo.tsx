import { useEffect, useRef } from "react";

const FADE_SECONDS = 0.5;
const REPLAY_DELAY_MS = 100;

/**
 * Full-bleed background video with a JS-controlled fade loop:
 * starts at opacity 0, fades in over the first 0.5s of playback, fades out
 * over the last 0.5s, and on `ended` snaps to opacity 0, waits 100ms, then
 * replays from the beginning. Driven by requestAnimationFrame — no CSS
 * transitions, no gradient overlays.
 */
export default function BackgroundVideo({ src }: { src: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		let rafId = 0;
		let replayTimer: number | undefined;

		const tick = () => {
			const { currentTime, duration } = video;
			if (!video.ended && Number.isFinite(duration) && duration > 0) {
				const fadeIn = Math.min(currentTime / FADE_SECONDS, 1);
				const fadeOut = Math.min(
					Math.max(duration - currentTime, 0) / FADE_SECONDS,
					1,
				);
				video.style.opacity = Math.max(0, Math.min(fadeIn, fadeOut)).toFixed(3);
			}
			rafId = requestAnimationFrame(tick);
		};

		const handleEnded = () => {
			video.style.opacity = "0";
			replayTimer = window.setTimeout(() => {
				video.currentTime = 0;
				void video.play().catch(() => {});
			}, REPLAY_DELAY_MS);
		};

		video.addEventListener("ended", handleEnded);
		void video.play().catch(() => {});
		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			window.clearTimeout(replayTimer);
			video.removeEventListener("ended", handleEnded);
		};
	}, []);

	return (
		<video
			ref={videoRef}
			src={src}
			className="absolute inset-0 h-full w-full object-cover"
			style={{ opacity: 0 }}
			autoPlay
			muted
			playsInline
			preload="auto"
			aria-hidden="true"
			tabIndex={-1}
		/>
	);
}
