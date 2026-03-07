import type { Meta, StoryObj } from "@storybook/nextjs";
import { treemapData } from "@/components/elements/charts/client/stories-data";
import { TreemapChartElement } from "@/components/elements/charts/client/treemap-chart-element";

const meta = {
	title: "elements/charts/TreemapChartElement",
	component: TreemapChartElement,
	tags: ["autodocs"],
	args: {
		title: "Hierarchy by Size",
		description: "Use for hierarchy with size emphasis.",
		data: treemapData,
		showTooltip: true,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for hierarchical composition by area. Avoid when exact value comparison across siblings is critical.",
			},
		},
	},
} satisfies Meta<typeof TreemapChartElement>;

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
		errorMessage: "Treemap data failed to load.",
	},
};
