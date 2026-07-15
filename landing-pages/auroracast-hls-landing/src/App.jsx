import { useCallback, useState } from "react";
import GlassNav from "./components/GlassNav.jsx";
import Hero from "./components/Hero.jsx";
import HlsBackground from "./components/HlsBackground.jsx";
import Telemetry from "./components/Telemetry.jsx";

export default function App() {
	const [muted, setMuted] = useState(true);
	const [stats, setStats] = useState({});

	const handleTelemetry = useCallback((partial) => {
		setStats((prev) => ({ ...prev, ...partial }));
	}, []);

	return (
		<div className="page">
			<HlsBackground muted={muted} onTelemetry={handleTelemetry} />
			<GlassNav />
			<main className="stage">
				<Hero />
				<Telemetry
					stats={stats}
					muted={muted}
					onToggleMute={() => setMuted((v) => !v)}
				/>
			</main>
			<span className="edge-label edge-label--left" aria-hidden="true">
				AURORACAST · LIVE VIDEO INFRASTRUCTURE
			</span>
			<span className="edge-label edge-label--right" aria-hidden="true">
				47.61°N — 122.33°W · EDGE NODE 114
			</span>
		</div>
	);
}
