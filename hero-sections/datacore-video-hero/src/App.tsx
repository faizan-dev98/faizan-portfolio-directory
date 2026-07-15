import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

const VIDEO_URL =
	"/assets/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

export default function App() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-dark">
			{/* Full-screen opaque video background — no overlay */}
			<video
				className="absolute inset-0 z-0 h-full w-full object-cover"
				src={VIDEO_URL}
				autoPlay
				loop
				muted
				playsInline
				preload="auto"
				aria-hidden="true"
				tabIndex={-1}
			/>
			<Navbar />
			<Hero />
		</main>
	);
}
