"use client";

import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	SankeyData,
} from "@/components/elements/charts/client/types";
import { toRechartsSankeyData } from "@/components/elements/charts/client/utils/sankey";

interface SankeyChartElementProps
	extends Omit<BaseChartProps<SankeyData>, "data"> {
	data: SankeyData;
	nodeWidth?: number;
	nodePadding?: number;
	linkCurvature?: number;
}

export function SankeyChartElement({
	title,
	description,
	data,
	height = 360,
	loading,
	empty,
	errorMessage,
	showTooltip = true,
	className,
	nodeWidth = 18,
	nodePadding = 20,
	linkCurvature = 0.5,
}: SankeyChartElementProps) {
	const normalized = toRechartsSankeyData(data);
	const hasData = normalized.nodes.length > 0 && normalized.links.length > 0;

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
				<Sankey
					data={normalized}
					nodePadding={nodePadding}
					nodeWidth={nodeWidth}
					linkCurvature={linkCurvature}
					node={{ fill: "var(--chart-2)", stroke: "var(--border)" }}
					link={{ stroke: "var(--chart-1)", strokeOpacity: 0.35 }}
				>
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
				</Sankey>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
