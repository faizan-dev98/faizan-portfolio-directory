import { useEffect, useState } from "react";

const FPS = 24;

function pad(n: number): string {
	return n.toString().padStart(2, "0");
}

/** A running SMPTE-style timecode, ticking at 24 frames per second. */
export default function Timecode() {
	const [code, setCode] = useState("00:00:00:00");

	useEffect(() => {
		const start = performance.now();
		let raf = 0;

		const tick = (now: number) => {
			const elapsed = (now - start) / 1000;
			const frames = Math.floor(elapsed * FPS) % FPS;
			const seconds = Math.floor(elapsed) % 60;
			const minutes = Math.floor(elapsed / 60) % 60;
			const hours = Math.floor(elapsed / 3600) % 100;
			setCode(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`);
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<span data-testid="timecode" className="tabular-nums">
			{code}
		</span>
	);
}
