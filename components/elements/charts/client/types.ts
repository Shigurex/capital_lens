export type ChartPrimitive = string | number | null | undefined;
export type ChartRecord = Record<string, ChartPrimitive>;

export type ChartColorScheme = "categorical" | "financial" | "neutral";

export interface BaseChartProps<TData = unknown> {
	title?: string;
	description?: string;
	data: TData[];
	height?: number;
	margin?: Partial<{
		top: number;
		right: number;
		bottom: number;
		left: number;
	}>;
	loading?: boolean;
	empty?: boolean;
	errorMessage?: string;
	showLegend?: boolean;
	showTooltip?: boolean;
	colorScheme?: ChartColorScheme;
	className?: string;
}

export interface CartesianSeries {
	key: string;
	label: string;
	colorToken?: string;
	type?: "line" | "bar";
	stackId?: string;
}

export interface WaterfallDatum {
	label: string;
	delta: number;
	type?: "change" | "subtotal" | "total";
}

export interface BoxPlotDatum {
	category: string;
	min: number;
	q1: number;
	median: number;
	q3: number;
	max: number;
	outliers?: number[];
}

export interface TreeNode {
	id: string;
	name: string;
	value?: number;
	children?: TreeNode[];
	[key: string]: unknown;
}

export interface SankeyNode {
	id: string;
	name: string;
}

export interface SankeyLink {
	sourceId: string;
	targetId: string;
	value: number;
}

export interface SankeyData {
	nodes: SankeyNode[];
	links: SankeyLink[];
}
