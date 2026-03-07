"use client";

import { ResponsiveContainer, SunburstChart, Tooltip } from "recharts";

import { ChartFrame } from "@/components/elements/charts/client/chart-frame";
import { ChartTooltipContent } from "@/components/elements/charts/client/chart-tooltip";
import type {
	BaseChartProps,
	TreeNode,
} from "@/components/elements/charts/client/types";

interface SunburstChartElementProps extends BaseChartProps<TreeNode> {
	dataKey?: string;
	nameKey?: string;
}

function normalizeNodeValue(node: TreeNode): TreeNode {
	const children = Array.isArray(node.children)
		? node.children.map((child) => normalizeNodeValue(child))
		: undefined;
	const childrenTotal =
		children?.reduce(
			(total, child) =>
				total + (typeof child.value === "number" ? child.value : 0),
			0,
		) ?? 0;
	const ownValue = typeof node.value === "number" ? node.value : childrenTotal;

	return {
		...node,
		children,
		value: ownValue,
	};
}

export function SunburstChartElement({
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
}: SunburstChartElementProps) {
	const normalizedChildren = data.map((node) => normalizeNodeValue(node));
	const rootValue = normalizedChildren.reduce(
		(total, node) => total + (typeof node.value === "number" ? node.value : 0),
		0,
	);
	const normalizedData = {
		name: "root",
		value: rootValue,
		children: normalizedChildren,
	};
	const hasData = normalizedChildren.length > 0 && rootValue > 0;

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
				<SunburstChart
					data={normalizedData}
					dataKey={dataKey}
					nameKey={nameKey}
					fill="var(--chart-1)"
				>
					{showTooltip ? <Tooltip content={<ChartTooltipContent />} /> : null}
				</SunburstChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
