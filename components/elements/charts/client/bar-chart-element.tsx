"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartLegendContent } from "@/components/elements/charts/client/chart-legend";
import { resolveSeriesColor } from "@/components/elements/charts/client/chart-theme";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	CartesianSeries,
	ChartColorScheme,
	ChartRecord,
} from "@/components/elements/charts/client/types";

interface BarChartElementProps extends BaseChartProps<ChartRecord> {
	xKey: string;
	series: CartesianSeries[];
	valueFormatter?: (value: number | string) => string;
	xAxisFormatter?: (value: number | string) => string;
	showGrid?: boolean;
}

export function BarChartElement({
	title,
	description,
	data,
	height = 320,
	margin,
	loading,
	empty,
	errorMessage,
	showLegend = true,
	showTooltip = true,
	colorScheme = "categorical",
	className,
	xKey,
	series,
	valueFormatter,
	xAxisFormatter,
	showGrid = true,
}: BarChartElementProps) {
	const validSeries = series.filter((item) => item.key.trim().length > 0);
	const hasData = data.length > 0 && validSeries.length > 0;

	return (
		<ChartFrame
			title={title}
			description={description}
			loading={loading}
			empty={empty}
			errorMessage={errorMessage}
			hasData={hasData}
			height={height}
			className={className}
		>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{ top: 8, right: 8, bottom: 0, left: 0, ...margin }}
				>
					{showGrid ? (
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					) : null}
					<XAxis
						dataKey={xKey}
						tickFormatter={xAxisFormatter}
						tick={{ fontSize: 12 }}
					/>
					<YAxis tick={{ fontSize: 12 }} />
					{showTooltip ? (
						<Tooltip
							content={
								<ChartTooltipContent
									valueFormatter={valueFormatter}
									labelFormatter={(label) =>
										xAxisFormatter ? xAxisFormatter(label) : String(label)
									}
								/>
							}
						/>
					) : null}
					{showLegend ? <Legend content={<ChartLegendContent />} /> : null}
					{validSeries.map((item, idx) => (
						<Bar
							key={item.key}
							name={item.label}
							dataKey={item.key}
							stackId={item.stackId}
							fill={resolveSeriesColor(
								idx,
								item.colorToken,
								colorScheme as ChartColorScheme,
							)}
							radius={[6, 6, 0, 0]}
						/>
					))}
				</BarChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
