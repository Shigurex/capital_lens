"use client";

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartLegendContent } from "@/components/elements/charts/client/chart-legend";
import { resolveSeriesColor } from "@/components/elements/charts/client/chart-theme";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	ChartColorScheme,
	ChartRecord,
} from "@/components/elements/charts/client/types";

interface PieChartElementProps extends BaseChartProps<ChartRecord> {
	nameKey: string;
	valueKey: string;
	innerRadius?: number;
	outerRadius?: number;
}

export function PieChartElement({
	title,
	description,
	data,
	height = 320,
	loading,
	empty,
	errorMessage,
	showLegend = true,
	showTooltip = true,
	colorScheme = "categorical",
	className,
	nameKey,
	valueKey,
	innerRadius = 60,
	outerRadius = 110,
}: PieChartElementProps) {
	const hasData = data.length > 0;

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
				<PieChart>
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
					{showLegend ? <Legend content={<ChartLegendContent />} /> : null}
					<Pie
						data={data}
						dataKey={valueKey}
						nameKey={nameKey}
						innerRadius={innerRadius}
						outerRadius={outerRadius}
					>
						{data.map((entry, idx) => (
							<Cell
								key={`${String(entry[nameKey])}-${String(entry[valueKey])}`}
								fill={resolveSeriesColor(
									idx,
									undefined,
									colorScheme as ChartColorScheme,
								)}
							/>
						))}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
