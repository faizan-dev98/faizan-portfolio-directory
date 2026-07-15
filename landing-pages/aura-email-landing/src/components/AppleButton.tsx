import { ChevronRight } from "lucide-react";
import AppleLogo from "./AppleLogo";

export default function AppleButton({
	label = "Download Aura",
	full = false,
}: {
	label?: string;
	full?: boolean;
}) {
	return (
		<button
			type="button"
			className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98]${full ? " w-full" : ""}`}
		>
			<AppleLogo />
			<span>{label}</span>
			<ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
		</button>
	);
}
