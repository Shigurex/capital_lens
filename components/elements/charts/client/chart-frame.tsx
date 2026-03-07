import type { ReactNode } from "react";
import {
	ChartEmptyState,
	ChartErrorState,
	ChartLoadingState,
} from "@/components/elements/charts/client/chart-state";
import { cn } from "@/lib/utils";

interface ChartFrameProps {
	title?: string;
	description?: string;
	loading?: boolean;
	empty?: boolean;
	errorMessage?: string;
	hasData: boolean;
	className?: string;
	height?: number;
	children: ReactNode;
}

export function ChartFrame({
	title,
	description,
	loading,
	empty,
	errorMessage,
	hasData,
	className,
	height,
	children,
}: ChartFrameProps) {
	return (
		<section
			className={cn(
				"w-full rounded-xl border border-border bg-card p-4",
				className,
			)}
		>
			{title ? (
				<h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
			) : null}
			{description ? (
				<p className="mt-1 text-xs text-muted-foreground">{description}</p>
			) : null}
			<div
				className={cn("mt-3", height ? "" : "min-h-64")}
				style={height ? { height } : undefined}
			>
				{errorMessage ? (
					<ChartErrorState message={errorMessage} />
				) : loading ? (
					<ChartLoadingState />
				) : empty || !hasData ? (
					<ChartEmptyState />
				) : (
					children
				)}
			</div>
		</section>
	);
}
