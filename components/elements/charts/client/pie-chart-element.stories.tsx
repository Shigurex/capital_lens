import type { Meta, StoryObj } from "@storybook/nextjs";

import { PieChartElement } from "@/components/elements/charts/client/pie-chart-element";
import { pieData } from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/PieChartElement",
	component: PieChartElement,
	tags: ["autodocs"],
	args: {
		title: "Portfolio Mix",
		description: "Use for part-to-whole composition with limited slices.",
		data: pieData,
		nameKey: "segment",
		valueKey: "value",
		showLegend: true,
		showTooltip: true,
		innerRadius: 60,
		outerRadius: 110,
	},
	argTypes: {
		innerRadius: { control: { type: "range", min: 0, max: 100, step: 2 } },
		outerRadius: { control: { type: "range", min: 80, max: 160, step: 2 } },
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for simple composition. Avoid for many segments or tiny differences.",
			},
		},
	},
} satisfies Meta<typeof PieChartElement>;

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
		errorMessage: "Failed to load composition data.",
	},
};
