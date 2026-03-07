import { Loader2 } from "lucide-react";

interface ChartStateProps {
	message?: string;
}

export function ChartLoadingState({
	message = "Loading chart...",
}: ChartStateProps) {
	return (
		<div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-muted-foreground">
			<div className="flex items-center gap-2 text-sm">
				<Loader2 className="size-4 animate-spin" />
				<span>{message}</span>
			</div>
		</div>
	);
}

export function ChartEmptyState({
	message = "No data available",
}: ChartStateProps) {
	return (
		<div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
			{message}
		</div>
	);
}

export function ChartErrorState({
	message = "Failed to render chart",
}: ChartStateProps) {
	return (
		<div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
			{message}
		</div>
	);
}
