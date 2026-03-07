import type { Meta, StoryObj } from "@storybook/nextjs";

import { SymbolChartPanel } from "@/components/blocks/symbol/client/symbol-chart-panel";
import type { SymbolChartPanelViewModel } from "@/components/blocks/symbol/types";
import {
	lineAndBarData,
	radarData,
	treemapData,
} from "@/components/elements/charts/client/stories-data";

const viewModel: SymbolChartPanelViewModel = {
	datasetsByRange: {
		"1M": {
			kind: "line",
			title: "Price Trend",
			description: "1M trend",
			data: lineAndBarData,
			xKey: "period",
			series: [
				{ key: "revenue", label: "Revenue" },
				{ key: "profit", label: "Profit" },
			],
		},
		"3M": {
			kind: "radar",
			title: "Quality Radar",
			description: "3M profile",
			data: radarData,
			categoryKey: "metric",
			series: [
				{ key: "current", label: "Current" },
				{ key: "benchmark", label: "Benchmark" },
			],
		},
		"6M": {
			kind: "treemap",
			title: "Segment Mix",
			description: "6M hierarchy",
			data: treemapData,
		},
	},
	rangeOrder: ["1M", "3M", "6M"],
	defaultRange: "1M",
};

const meta = {
	title: "blocks/symbol/SymbolChartPanel",
	component: SymbolChartPanel,
	tags: ["autodocs"],
	args: {
		viewModel,
	},
} satisfies Meta<typeof SymbolChartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
