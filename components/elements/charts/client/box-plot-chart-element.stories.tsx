import type { Meta, StoryObj } from "@storybook/nextjs";

import { BoxPlotChartElement } from "@/components/elements/charts/client/box-plot-chart-element";
import {
	boxPlotData,
	boxPlotShowcaseData,
} from "@/components/elements/charts/client/stories-data";

const meta = {
	title: "elements/charts/BoxPlotChartElement",
	component: BoxPlotChartElement,
	tags: ["autodocs"],
	args: {
		title: "Factor Distribution Box Plot",
		description:
			"Score distribution by factor. Designed sample for portfolio analytics.",
		data: boxPlotShowcaseData,
		showTooltip: true,
		boxWidth: 22,
		height: 400,
	},
	argTypes: {
		boxWidth: { control: { type: "range", min: 12, max: 36, step: 1 } },
	},
	parameters: {
		docs: {
			description: {
				component:
					"Suitable for comparing distributions across categories. Avoid when audience needs individual point-level traceability.",
			},
		},
	},
} satisfies Meta<typeof BoxPlotChartElement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExampleDesign: Story = {
	args: {
		title: "Factor Distribution (Example Design)",
		description: "Stakeholder-facing sample with outlier emphasis.",
		data: boxPlotShowcaseData,
	},
};

export const Minimal: Story = {
	args: {
		title: "Minimal Distribution",
		description: "Simple quartile dataset.",
		data: boxPlotData,
		height: 340,
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
		errorMessage: "Box plot data failed to load.",
	},
};

export const InvalidData: Story = {
	args: {
		data: [
			{ category: "Invalid", min: 30, q1: 20, median: 25, q3: 35, max: 40 },
		],
	},
};
