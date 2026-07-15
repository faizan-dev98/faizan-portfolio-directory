import Hls from "hls.js";
import { useEffect, useRef } from "react";

const STREAM_URL =
	"https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

export default function BackgroundVideo() {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		/* MSE path — hls.js with the worker disabled for sandboxed stability. */
		if (Hls.isSupported()) {
			const hls = new Hls({ enableWorker: false });
			hls.loadSource(STREAM_URL);
			hls.attachMedia(video);
			return () => hls.destroy();
		}

		/* Native HLS path (Safari). */
		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = STREAM_URL;
			return () => {
				video.removeAttribute("src");
				video.load();
			};
		}
	}, []);

	return (
		<video
			ref={videoRef}
			data-testid="bg-video"
			className="absolute inset-0 h-full w-full object-cover opacity-60"
			autoPlay
			muted
			loop
			playsInline
			aria-hidden="true"
			tabIndex={-1}
		/>
	);
}
