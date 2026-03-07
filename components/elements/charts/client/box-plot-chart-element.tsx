"use client";

import {
	CartesianGrid,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { chartSemanticColors } from "@/components/elements/charts/client/chart-theme";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	BoxPlotDatum,
} from "@/components/elements/charts/client/types";
import {
	getBoxPlotDomain,
	validateBoxPlotData,
} from "@/components/elements/charts/client/utils/box-plot";

interface BoxPlotChartElementProps extends BaseChartProps<BoxPlotDatum> {
	boxWidth?: number;
}

type BoxShapeProps = {
	cx?: number;
	payload?: BoxPlotDatum;
	yAxis?: {
		scale?: (value: number) => number;
	};
	boxWidth?: number;
};

function BoxPlotShape({ cx, payload, yAxis, boxWidth = 22 }: BoxShapeProps) {
	if (!payload || typeof cx !== "number" || !yAxis?.scale) {
		return null;
	}

	const yMin = yAxis.scale(payload.min);
	const yQ1 = yAxis.scale(payload.q1);
	const yMedian = yAxis.scale(payload.median);
	const yQ3 = yAxis.scale(payload.q3);
	const yMax = yAxis.scale(payload.max);
	const whiskerWidth = Math.max(8, boxWidth * 0.5);

	return (
		<g>
			<line
				x1={cx}
				x2={cx}
				y1={yMin}
				y2={yMax}
				stroke={chartSemanticColors.neutral}
				strokeWidth={1.5}
			/>
			<line
				x1={cx - whiskerWidth / 2}
				x2={cx + whiskerWidth / 2}
				y1={yMin}
				y2={yMin}
				stroke={chartSemanticColors.neutral}
				strokeWidth={1.5}
			/>
			<line
				x1={cx - whiskerWidth / 2}
				x2={cx + whiskerWidth / 2}
				y1={yMax}
				y2={yMax}
				stroke={chartSemanticColors.neutral}
				strokeWidth={1.5}
			/>
			<rect
				x={cx - boxWidth / 2}
				y={Math.min(yQ1, yQ3)}
				width={boxWidth}
				height={Math.abs(yQ3 - yQ1)}
				fill="var(--chart-1)"
				fillOpacity={0.35}
				stroke="var(--chart-1)"
				strokeWidth={1.5}
				rx={3}
			/>
			<line
				x1={cx - boxWidth / 2}
				x2={cx + boxWidth / 2}
				y1={yMedian}
				y2={yMedian}
				stroke="var(--chart-1)"
				strokeWidth={2}
			/>
			{payload.outliers?.map((outlier) => (
				<circle
					key={`${payload.category}-${outlier}`}
					cx={cx}
					cy={yAxis.scale?.(outlier)}
					r={2.5}
					fill={chartSemanticColors.negative}
				/>
			))}
		</g>
	);
}

export function BoxPlotChartElement({
	title,
	description,
	data,
	height = 340,
	margin,
	loading,
	empty,
	errorMessage,
	showTooltip = true,
	className,
	boxWidth,
}: BoxPlotChartElementProps) {
	const result = validateBoxPlotData(data);
	const hasData = data.length > 0;
	const domain = getBoxPlotDomain(data);
	const invalidMessage = result.valid
		? undefined
		: "Invalid box-plot data detected. Expect min <= q1 <= median <= q3 <= max.";

	return (
		<ChartFrame
			title={title}
			description={description}
			loading={loading}
			empty={empty}
			errorMessage={errorMessage ?? invalidMessage}
			hasData={hasData}
			height={height}
			className={className}
		>
			<ResponsiveContainer width="100%" height="100%">
				<ScatterChart
					data={data}
					margin={{ top: 8, right: 8, bottom: 0, left: 0, ...margin }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis dataKey="category" type="category" tick={{ fontSize: 12 }} />
					<YAxis domain={domain} tick={{ fontSize: 12 }} />
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
					<Scatter
						data={data}
						dataKey="median"
						shape={(props) => (
							<BoxPlotShape {...(props as BoxShapeProps)} boxWidth={boxWidth} />
						)}
					/>
				</ScatterChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
