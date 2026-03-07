"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartLegendContent } from "@/components/elements/charts/client/chart-legend";
import { chartSemanticColors } from "@/components/elements/charts/client/chart-theme";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	WaterfallDatum,
} from "@/components/elements/charts/client/types";
import {
	buildWaterfallPoints,
	getWaterfallDomain,
} from "@/components/elements/charts/client/utils/waterfall";

interface WaterfallChartElementProps extends BaseChartProps<WaterfallDatum> {
	valueFormatter?: (value: number | string) => string;
}

export function WaterfallChartElement({
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
	className,
	valueFormatter,
}: WaterfallChartElementProps) {
	const points = buildWaterfallPoints(data);
	const hasData = points.length > 0;
	const domain = getWaterfallDomain(points);

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
					data={points}
					margin={{ top: 8, right: 8, bottom: 0, left: 0, ...margin }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis dataKey="label" tick={{ fontSize: 12 }} />
					<YAxis domain={domain} tick={{ fontSize: 12 }} />
					<ReferenceLine y={0} stroke="var(--border)" />
					{showTooltip ? (
						<Tooltip
							content={<ChartTooltipContent valueFormatter={valueFormatter} />}
						/>
					) : null}
					{showLegend ? <Legend content={<ChartLegendContent />} /> : null}
					<Bar
						dataKey="base"
						stackId="wf"
						fill="transparent"
						isAnimationActive={false}
					/>
					<Bar dataKey="span" stackId="wf" name="Delta" radius={[6, 6, 0, 0]}>
						{points.map((point) => {
							const fill =
								point.direction === "positive"
									? chartSemanticColors.positive
									: point.direction === "negative"
										? chartSemanticColors.negative
										: chartSemanticColors.total;
							return <Cell key={`${point.label}-${point.type}`} fill={fill} />;
						})}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
