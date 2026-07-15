import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"rounded-full bg-foreground text-background hover:bg-foreground/90",
				heroSecondary:
					"liquid-glass rounded-full text-foreground hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_28px_rgba(168,85,247,0.18)] active:scale-[0.98]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, ...props }, ref) => (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant }), className)}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { Button, buttonVariants };
