import type { Meta, StoryObj } from "@storybook/nextjs";
import { waterfallData } from "@/components/elements/charts/client/stories-data";
import { WaterfallChartElement } from "@/components/elements/charts/client/waterfall-chart-element";

const meta = {
	title: "elements/charts/WaterfallChartElement",
	component: WaterfallChartElement,
	tags: ["autodocs"],
	args: {
		title: "Contribution Analysis",
		description: "Use for cumulative impact visualization.",
		data: waterfallData,
		showLegend: true,
		showTooltip: true,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for additive/subtractive contribution. Avoid when each category is independent with no cumulative context.",
			},
		},
	},
} satisfies Meta<typeof WaterfallChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
	args: { loading: true },
};

export const Empty: Story = {
	args: {
		data: [],
		empty: true,
	},
};

export const ErrorState: Story = {
	args: {
		errorMessage: "Waterfall data failed to load.",
	},
};
