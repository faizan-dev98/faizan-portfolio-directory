import { useEffect, useState } from "react";

interface UseTypewriterOptions {
	text: string;
	speed?: number;
	startDelay?: number;
}

interface UseTypewriterReturn {
	displayed: string;
	done: boolean;
}

export function useTypewriter({
	text,
	speed = 38,
	startDelay = 600,
}: UseTypewriterOptions): UseTypewriterReturn {
	const [displayed, setDisplayed] = useState("");
	const [done, setDone] = useState(false);

	useEffect(() => {
		setDisplayed("");
		setDone(false);

		const delayTimer = setTimeout(() => {
			let index = 0;
			const interval = setInterval(() => {
				index += 1;
				setDisplayed(text.slice(0, index));
				if (index >= text.length) {
					clearInterval(interval);
					setDone(true);
				}
			}, speed);

			return () => clearInterval(interval);
		}, startDelay);

		return () => clearTimeout(delayTimer);
	}, [text, speed, startDelay]);

	return { displayed, done };
}
