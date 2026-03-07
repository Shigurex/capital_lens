interface LegendPayloadItem {
	value?: string;
	color?: string;
}

interface ChartLegendContentProps {
	payload?: LegendPayloadItem[];
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
	if (!payload || payload.length === 0) {
		return null;
	}

	return (
		<div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
			{payload.map((entry) => (
				<div
					key={`${entry.value}-${entry.color}`}
					className="flex items-center gap-1.5"
				>
					<span
						className="inline-block size-2 rounded-full"
						style={{ backgroundColor: entry.color ?? "var(--chart-1)" }}
					/>
					<span>{entry.value}</span>
				</div>
			))}
		</div>
	);
}
