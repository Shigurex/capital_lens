import type { Meta, StoryObj } from "@storybook/nextjs";
import {
	sunburstData,
	sunburstShowcaseData,
} from "@/components/elements/charts/client/stories-data";
import { SunburstChartElement } from "@/components/elements/charts/client/sunburst-chart-element";

const meta = {
	title: "elements/charts/SunburstChartElement",
	component: SunburstChartElement,
	tags: ["autodocs"],
	args: {
		title: "Asset Allocation Sunburst",
		description:
			"Portfolio allocation by asset class, region, and strategy depth.",
		data: sunburstShowcaseData,
		showTooltip: true,
		height: 420,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for multi-level composition. Avoid when labels cannot be read due too many small arcs.",
			},
		},
	},
} satisfies Meta<typeof SunburstChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExampleDesign: Story = {
	args: {
		title: "Portfolio Hierarchy (Example Design)",
		description: "Designed sample for stakeholder review and design sync.",
		data: sunburstShowcaseData,
	},
};

export const Minimal: Story = {
	args: {
		title: "Minimal Hierarchy",
		description: "Small hierarchy sample.",
		data: sunburstData,
		height: 360,
	},
};

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
		errorMessage: "Sunburst data failed to load.",
	},
};
