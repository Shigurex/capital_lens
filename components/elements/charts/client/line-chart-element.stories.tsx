import type { Meta, StoryObj } from "@storybook/nextjs";
import { formatNumber } from "@/components/elements/charts/client/formatters";
import { LineChartElement } from "@/components/elements/charts/client/line-chart-element";
import {
	largeNumberLineData,
	lineAndBarData,
	sparseLineData,
} from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/LineChartElement",
	component: LineChartElement,
	tags: ["autodocs"],
	args: {
		title: "Revenue Trend",
		description: "Use for time-series trend comparison.",
		data: lineAndBarData,
		xKey: "period",
		series: [
			{ key: "revenue", label: "Revenue" },
			{ key: "profit", label: "Profit" },
		],
		showLegend: true,
		showTooltip: true,
		colorScheme: "categorical",
	},
	argTypes: {
		colorScheme: {
			control: "radio",
			options: ["categorical", "financial", "neutral"],
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for trend-over-time. Avoid for part-to-whole comparison. Ensure axis labels remain readable under dense points.",
			},
		},
	},
} satisfies Meta<typeof LineChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		valueFormatter: (value: number | string) => formatNumber(Number(value)),
	},
};

export const Loading: Story = {
	args: {
		loading: true,
	},
};

export const Empty: Story = {
	args: {
		data: [],
		empty: true,
	},
};

export const ErrorState: Story = {
	args: {
		errorMessage: "Failed to fetch trend data.",
	},
};

export const LargeNumbers: Story = {
	args: {
		data: largeNumberLineData,
		xKey: "period",
		series: [{ key: "value", label: "Market Cap" }],
	},
};

export const SparseData: Story = {
	args: {
		data: sparseLineData,
		xKey: "period",
		series: [{ key: "value", label: "Sparse" }],
	},
};
