import type { Meta, StoryObj } from "@storybook/nextjs";

import { RadarChartElement } from "@/components/elements/charts/client/radar-chart-element";
import { radarData } from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/RadarChartElement",
	component: RadarChartElement,
	tags: ["autodocs"],
	args: {
		title: "Profile Comparison",
		description: "Use for multi-axis profile comparison.",
		data: radarData,
		categoryKey: "metric",
		series: [
			{ key: "current", label: "Current" },
			{ key: "benchmark", label: "Benchmark" },
		],
		showLegend: true,
		showTooltip: true,
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
					"Suitable for normalized metric profile. Avoid when axes are not comparable or scales are inconsistent.",
			},
		},
	},
} satisfies Meta<typeof RadarChartElement>;

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
		errorMessage: "Failed to load radar data.",
	},
};
