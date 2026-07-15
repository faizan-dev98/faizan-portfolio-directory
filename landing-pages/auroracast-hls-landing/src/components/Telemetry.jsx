const formatBitrate = (bps) =>
	bps == null ? "— — —" : `${(bps / 1_000_000).toFixed(2)} MBPS`;

const formatRes = (w, h) => (w && h ? `${w}×${h}` : "— — —");

const formatBuffer = (s) => (s == null ? "— — —" : `${s.toFixed(1)}S`);

const formatLadder = (level, levels) =>
	level == null || !levels ? "— — —" : `L${level + 1}/${levels}`;

/**
 * Glass telemetry strip (bottom-right) rendering live HLS stats —
 * resolution, bitrate, buffer ahead, and ABR ladder position.
 */
export default function Telemetry({ stats, muted, onToggleMute }) {
	const rows = [
		{ label: "Signal", value: formatRes(stats.width, stats.height) },
		{ label: "Bitrate", value: formatBitrate(stats.bitrate) },
		{ label: "Buffer", value: formatBuffer(stats.buffer) },
		{ label: "Ladder", value: formatLadder(stats.level, stats.levels) },
	];

	return (
		<aside
			className="telemetry reveal"
			style={{ "--reveal-order": 7 }}
			aria-label="Live stream telemetry"
		>
			<header className="telemetry__head">
				<span className="telemetry__title">{stats.protocol ?? "Tuning…"}</span>
				<button
					type="button"
					className="telemetry__mute"
					onClick={onToggleMute}
					aria-pressed={!muted}
					aria-label={
						muted ? "Unmute background video" : "Mute background video"
					}
				>
					{muted ? (
						<svg viewBox="0 0 16 16" aria-hidden="true">
							<path d="M2.5 6v4h2.7L9 13V3L5.2 6H2.5Z" fill="currentColor" />
							<path
								d="m11 6 4 4m0-4-4 4"
								stroke="currentColor"
								strokeWidth="1.4"
								strokeLinecap="round"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 16 16" aria-hidden="true">
							<path d="M2.5 6v4h2.7L9 13V3L5.2 6H2.5Z" fill="currentColor" />
							<path
								d="M11 5.5a3.6 3.6 0 0 1 0 5m1.6-7a6 6 0 0 1 0 9"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
							/>
						</svg>
					)}
				</button>
			</header>
			<dl className="telemetry__grid">
				{rows.map((row) => (
					<div key={row.label} className="telemetry__row">
						<dt>{row.label}</dt>
						<dd>{row.value}</dd>
					</div>
				))}
			</dl>
		</aside>
	);
}
