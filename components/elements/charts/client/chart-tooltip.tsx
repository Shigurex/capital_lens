import { cn } from "@/lib/utils";

interface TooltipPayloadItem {
	name?: string;
	value?: number | string;
	color?: string;
	dataKey?: string | number;
}

interface ChartTooltipContentProps {
	active?: boolean;
	payload?: TooltipPayloadItem[];
	label?: string | number;
	valueFormatter?: (value: number | string) => string;
	labelFormatter?: (value: string | number) => string;
}

export function ChartTooltipContent({
	active,
	payload,
	label,
	valueFormatter,
	labelFormatter,
}: ChartTooltipContentProps) {
	if (!active || !payload || payload.length === 0) {
		return null;
	}

	return (
		<div className="min-w-44 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
			{label !== undefined ? (
				<p className="mb-1 text-[11px] text-muted-foreground">
					{labelFormatter ? labelFormatter(label) : label}
				</p>
			) : null}
			<div className="space-y-1">
				{payload.map((item) => (
					<div
						key={`${item.dataKey}-${item.name}`}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"inline-block size-2 rounded-full",
									!item.color && "bg-chart-1",
								)}
								style={item.color ? { backgroundColor: item.color } : undefined}
							/>
							<span className="text-popover-foreground">{item.name}</span>
						</div>
						<span className="font-medium text-popover-foreground">
							{item.value !== undefined
								? valueFormatter
									? valueFormatter(item.value)
									: String(item.value)
								: "-"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
