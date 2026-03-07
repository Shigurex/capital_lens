"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	TreeNode,
} from "@/components/elements/charts/client/types";

interface TreemapChartElementProps extends BaseChartProps<TreeNode> {
	dataKey?: string;
	nameKey?: string;
}

export function TreemapChartElement({
	title,
	description,
	data,
	height = 360,
	loading,
	empty,
	errorMessage,
	showTooltip = true,
	className,
	dataKey = "value",
	nameKey = "name",
}: TreemapChartElementProps) {
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
				<Treemap
					data={data}
					dataKey={dataKey}
					nameKey={nameKey}
					stroke="var(--border)"
					fill="var(--chart-1)"
					aspectRatio={4 / 3}
				>
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
				</Treemap>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
