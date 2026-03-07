import type { Meta, StoryObj } from "@storybook/nextjs";

import { SankeyChartElement } from "@/components/elements/charts/client/sankey-chart-element";
import { sankeyData } from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/SankeyChartElement",
	component: SankeyChartElement,
	tags: ["autodocs"],
	args: {
		title: "Flow Analysis",
		description: "Use for source-to-target flow volume.",
		data: sankeyData,
		showTooltip: true,
		nodeWidth: 18,
		nodePadding: 20,
		linkCurvature: 0.5,
	},
	argTypes: {
		nodeWidth: { control: { type: "range", min: 8, max: 32, step: 1 } },
		nodePadding: { control: { type: "range", min: 8, max: 48, step: 1 } },
		linkCurvature: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for transfer/conversion flow. Avoid when sequence in time is the primary message.",
			},
		},
	},
} satisfies Meta<typeof SankeyChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
	args: { loading: true },
};

export const Empty: Story = {
	args: {
		data: { nodes: [], links: [] },
		empty: true,
	},
};

export const ErrorState: Story = {
	args: {
		errorMessage: "Flow data failed to load.",
	},
};
