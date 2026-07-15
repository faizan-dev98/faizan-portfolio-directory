import { useState } from "react";

const ORB_SRC = "https://future.co/images/homepage/glassy-orb/orb-purple.webm";

/**
 * The glassy orb. The source video is a bright orb on a solid black
 * background; `mix-blend-screen` knocks the black out — but screen-blending
 * over pure white renders nothing (screen can only lighten). So a deep
 * ink-blue radial "energy field" sits behind the video: the orb screens over
 * its dark core in vivid electric blue, and the field's fade-to-transparent
 * edge lets the video's black background dissolve seamlessly into the white
 * page.
 */
export default function GlassyOrb() {
	const [videoFailed, setVideoFailed] = useState(false);

	return (
		<div
			aria-hidden="true"
			className="relative mx-auto h-[420px] w-full max-w-[620px] sm:h-[540px] lg:h-[800px] lg:max-w-none lg:translate-x-[6%]"
		>
			{/* Dark energy field the orb screens over */}
			<div
				data-orb-stage
				className="animate-stage-breathe absolute inset-0 m-auto h-[92%] w-[92%] rounded-full bg-[radial-gradient(closest-side,#02060F_0%,#04122B_36%,#0A2D63_56%,rgba(10,45,99,0)_74%)]"
			/>

			{/* Floating wrapper so the float transform never touches the video's scale */}
			<div className="animate-orb-float absolute inset-0">
				<video
					data-orb-video
					src={ORB_SRC}
					autoPlay
					loop
					muted
					playsInline
					preload="auto"
					onError={() => setVideoFailed(true)}
					className="absolute inset-0 m-auto aspect-square w-[105%] max-w-none scale-125 object-cover mix-blend-screen [filter:hue-rotate(-55deg)_saturate(250%)_brightness(1.2)_contrast(1.1)]"
				/>

				{/* CSS fallback orb if the remote webm is unreachable */}
				{videoFailed && (
					<div className="absolute inset-0 m-auto aspect-square h-[58%] mix-blend-screen">
						<div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.95)_0%,rgba(96,177,255,0.85)_22%,rgba(0,132,255,0.9)_52%,rgba(4,18,43,0.95)_88%)] blur-[2px]" />
						<div className="absolute left-[18%] top-[12%] h-[26%] w-[34%] rounded-full bg-white/70 blur-[18px]" />
					</div>
				)}
			</div>
		</div>
	);
}
