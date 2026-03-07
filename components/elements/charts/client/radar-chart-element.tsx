"use client";

import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
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

interface RadarChartElementProps extends BaseChartProps<ChartRecord> {
	categoryKey: string;
	series: CartesianSeries[];
}

export function RadarChartElement({
	title,
	description,
	data,
	height = 360,
	loading,
	empty,
	errorMessage,
	showLegend = true,
	showTooltip = true,
	colorScheme = "categorical",
	className,
	categoryKey,
	series,
}: RadarChartElementProps) {
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
				<RadarChart data={data}>
					<PolarGrid stroke="var(--border)" />
					<PolarAngleAxis dataKey={categoryKey} tick={{ fontSize: 12 }} />
					<PolarRadiusAxis tick={{ fontSize: 11 }} />
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
					{showLegend ? <Legend content={<ChartLegendContent />} /> : null}
					{validSeries.map((item, idx) => {
						const color = resolveSeriesColor(
							idx,
							item.colorToken,
							colorScheme as ChartColorScheme,
						);
						return (
							<Radar
								key={item.key}
								name={item.label}
								dataKey={item.key}
								stroke={color}
								fill={color}
								fillOpacity={0.3}
							/>
						);
					})}
				</RadarChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
