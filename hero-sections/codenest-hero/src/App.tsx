import Header from "./components/Header";
import Hero from "./components/Hero";

export default function App() {
	return (
		<div className="relative min-h-screen bg-ink text-white">
			<Header />
			<main>
				<Hero />
			</main>
			<div className="grain" aria-hidden="true" />
		</div>
	);
}
