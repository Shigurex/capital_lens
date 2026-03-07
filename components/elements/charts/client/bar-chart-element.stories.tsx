import type { Meta, StoryObj } from "@storybook/nextjs";

import { BarChartElement } from "@/components/elements/charts/client/bar-chart-element";
import {
	lineAndBarData,
	longLabelData,
	negativeValueBarData,
} from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/BarChartElement",
	component: BarChartElement,
	tags: ["autodocs"],
	args: {
		title: "Category Comparison",
		description: "Use for side-by-side categorical comparison.",
		data: lineAndBarData,
		xKey: "period",
		series: [
			{ key: "revenue", label: "Revenue" },
			{ key: "expense", label: "Expense" },
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
					"Suitable for category or period comparison. Avoid when there are too many categories with long labels without truncation strategy.",
			},
		},
	},
} satisfies Meta<typeof BarChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
		errorMessage: "Failed to load bar chart data.",
	},
};

export const NegativeValues: Story = {
	args: {
		data: negativeValueBarData,
		xKey: "label",
		series: [{ key: "score", label: "Score" }],
		colorScheme: "financial",
	},
};

export const LongLabels: Story = {
	args: {
		data: longLabelData,
		xKey: "label",
		series: [{ key: "value", label: "Value" }],
	},
};
