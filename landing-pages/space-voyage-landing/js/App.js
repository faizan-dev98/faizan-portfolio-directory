/* App — mounts the page on #root. */
(() => {
	const { Hero, Capabilities } = window;

	function App() {
		return (
			<main className="bg-black">
				<Hero />
				<Capabilities />
			</main>
		);
	}

	window.App = App;

	const root = ReactDOM.createRoot(document.getElementById("root"));
	root.render(<App />);
})();
