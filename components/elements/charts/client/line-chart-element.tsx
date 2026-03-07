"use client";

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartLegendContent } from "@/components/elements/charts/client/chart-legend";
import {
	chartSemanticColors,
	resolveSeriesColor,
} from "@/components/elements/charts/client/chart-theme";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	CartesianSeries,
	ChartColorScheme,
	ChartRecord,
} from "@/components/elements/charts/client/types";

interface LineChartElementProps extends BaseChartProps<ChartRecord> {
	xKey: string;
	series: CartesianSeries[];
	valueFormatter?: (value: number | string) => string;
	xAxisFormatter?: (value: number | string) => string;
	showGrid?: boolean;
	curveType?: "linear" | "monotone" | "step";
}

function normalizeSeries(series: CartesianSeries[]) {
	return series.filter((item) => item.key.trim().length > 0);
}

export function LineChartElement({
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
	curveType = "monotone",
}: LineChartElementProps) {
	const validSeries = normalizeSeries(series);
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
				<LineChart
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
						<Line
							key={item.key}
							type={curveType}
							dataKey={item.key}
							name={item.label}
							stroke={resolveSeriesColor(
								idx,
								item.colorToken,
								colorScheme as ChartColorScheme,
							)}
							strokeWidth={2}
							dot={{ r: 2 }}
							activeDot={{ r: 4 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}

export const lineChartSemanticColors = chartSemanticColors;
