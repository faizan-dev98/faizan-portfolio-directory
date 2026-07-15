import { Link } from "react-router-dom";

const NotFound = () => (
	<div
		style={{
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: 12,
			background: "#EEF1F7",
			color: "#11315D",
			fontFamily: '"Inter Tight", sans-serif',
		}}
	>
		<h1 style={{ fontSize: 48, fontWeight: 600, margin: 0 }}>404</h1>
		<p style={{ color: "rgba(13,27,75,0.5)", margin: 0 }}>
			This page could not be found.
		</p>
		<Link
			to="/"
			style={{
				color: "rgba(13,27,75,0.65)",
				textDecoration: "underline",
				textUnderlineOffset: 2,
			}}
		>
			Back home
		</Link>
	</div>
);

export default NotFound;
