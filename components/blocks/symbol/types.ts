import type {
	BoxPlotDatum,
	CartesianSeries,
	ChartColorScheme,
	ChartRecord,
	SankeyData,
	TreeNode,
	WaterfallDatum,
} from "@/components/elements/charts/client/types";

interface SymbolChartBase {
	kind:
		| "line"
		| "bar"
		| "pie"
		| "radar"
		| "treemap"
		| "sunburst"
		| "sankey"
		| "waterfall"
		| "boxPlot";
	title?: string;
	description?: string;
	colorScheme?: ChartColorScheme;
	showLegend?: boolean;
	showTooltip?: boolean;
	height?: number;
}

export interface SymbolLineOrBarChartPayload extends SymbolChartBase {
	kind: "line" | "bar";
	data: ChartRecord[];
	xKey: string;
	series: CartesianSeries[];
}

export interface SymbolRadarChartPayload extends SymbolChartBase {
	kind: "radar";
	data: ChartRecord[];
	categoryKey: string;
	series: CartesianSeries[];
}

export interface SymbolPieChartPayload extends SymbolChartBase {
	kind: "pie";
	data: ChartRecord[];
	nameKey: string;
	valueKey: string;
	innerRadius?: number;
	outerRadius?: number;
}

export interface SymbolTreemapChartPayload extends SymbolChartBase {
	kind: "treemap";
	data: TreeNode[];
	dataKey?: string;
	nameKey?: string;
}

export interface SymbolSunburstChartPayload extends SymbolChartBase {
	kind: "sunburst";
	data: TreeNode[];
	dataKey?: string;
	nameKey?: string;
}

export interface SymbolSankeyChartPayload extends SymbolChartBase {
	kind: "sankey";
	data: SankeyData;
	nodeWidth?: number;
	nodePadding?: number;
	linkCurvature?: number;
}

export interface SymbolWaterfallChartPayload extends SymbolChartBase {
	kind: "waterfall";
	data: WaterfallDatum[];
}

export interface SymbolBoxPlotChartPayload extends SymbolChartBase {
	kind: "boxPlot";
	data: BoxPlotDatum[];
	boxWidth?: number;
}

export type SymbolChartPayload =
	| SymbolLineOrBarChartPayload
	| SymbolRadarChartPayload
	| SymbolPieChartPayload
	| SymbolTreemapChartPayload
	| SymbolSunburstChartPayload
	| SymbolSankeyChartPayload
	| SymbolWaterfallChartPayload
	| SymbolBoxPlotChartPayload;

export interface SymbolChartPanelViewModel {
	datasetsByRange: Record<string, SymbolChartPayload>;
	rangeOrder?: string[];
	defaultRange?: string;
}
