import type {
	BoxPlotDatum,
	ChartRecord,
	SankeyData,
	TreeNode,
	WaterfallDatum,
} from "@/components/elements/charts/client/types";

export const lineAndBarData: ChartRecord[] = [
	{ period: "1月", revenue: 1200, expense: 900, profit: 300 },
	{ period: "2月", revenue: 1320, expense: 980, profit: 340 },
	{ period: "3月", revenue: 1410, expense: 1020, profit: 390 },
	{ period: "4月", revenue: 1570, expense: 1090, profit: 480 },
	{ period: "5月", revenue: 1620, expense: 1180, profit: 440 },
	{ period: "6月", revenue: 1730, expense: 1210, profit: 520 },
];

export const pieData: ChartRecord[] = [
	{ segment: "Tech", value: 38 },
	{ segment: "Finance", value: 24 },
	{ segment: "Industrial", value: 18 },
	{ segment: "Healthcare", value: 12 },
	{ segment: "Others", value: 8 },
];

export const radarData: ChartRecord[] = [
	{ metric: "Growth", current: 82, benchmark: 70 },
	{ metric: "Stability", current: 68, benchmark: 72 },
	{ metric: "Profitability", current: 76, benchmark: 65 },
	{ metric: "Liquidity", current: 64, benchmark: 60 },
	{ metric: "Momentum", current: 71, benchmark: 66 },
];

export const waterfallData: WaterfallDatum[] = [
	{ label: "開始", delta: 1000, type: "total" },
	{ label: "売上増", delta: 240, type: "change" },
	{ label: "原価増", delta: -120, type: "change" },
	{ label: "販管費", delta: -90, type: "change" },
	{ label: "小計", delta: 0, type: "subtotal" },
	{ label: "税引後", delta: 980, type: "total" },
];

export const boxPlotData: BoxPlotDatum[] = [
	{
		category: "A",
		min: 12,
		q1: 20,
		median: 27,
		q3: 34,
		max: 42,
		outliers: [9, 47],
	},
	{ category: "B", min: 10, q1: 18, median: 25, q3: 31, max: 39 },
	{
		category: "C",
		min: 14,
		q1: 21,
		median: 29,
		q3: 35,
		max: 44,
		outliers: [6],
	},
	{ category: "D", min: 8, q1: 16, median: 23, q3: 30, max: 38 },
];

export const boxPlotShowcaseData: BoxPlotDatum[] = [
	{
		category: "Growth",
		min: 15,
		q1: 28,
		median: 36,
		q3: 44,
		max: 58,
		outliers: [10, 63],
	},
	{ category: "Value", min: 11, q1: 21, median: 30, q3: 37, max: 49 },
	{
		category: "Quality",
		min: 18,
		q1: 31,
		median: 41,
		q3: 52,
		max: 66,
		outliers: [72],
	},
	{
		category: "Momentum",
		min: 9,
		q1: 17,
		median: 25,
		q3: 34,
		max: 48,
		outliers: [4],
	},
	{ category: "Income", min: 13, q1: 24, median: 33, q3: 40, max: 55 },
];

export const treemapData: TreeNode[] = [
	{
		id: "market",
		name: "Market",
		children: [
			{ id: "market-tech", name: "Tech", value: 420 },
			{ id: "market-finance", name: "Finance", value: 300 },
			{ id: "market-industrial", name: "Industrial", value: 220 },
			{ id: "market-health", name: "Healthcare", value: 180 },
		],
	},
];

export const sunburstData: TreeNode[] = [
	{
		id: "portfolio-tech",
		name: "Tech",
		children: [
			{ id: "portfolio-tech-software", name: "Software", value: 120 },
			{ id: "portfolio-tech-semiconductor", name: "Semiconductor", value: 90 },
			{ id: "portfolio-tech-hardware", name: "Hardware", value: 60 },
		],
	},
	{
		id: "portfolio-finance",
		name: "Finance",
		children: [
			{ id: "portfolio-finance-bank", name: "Bank", value: 110 },
			{ id: "portfolio-finance-insurance", name: "Insurance", value: 75 },
		],
	},
];

export const sunburstShowcaseData: TreeNode[] = [
	{
		id: "equity",
		name: "Equity",
		children: [
			{
				id: "equity-japan",
				name: "Japan",
				children: [
					{ id: "equity-japan-growth", name: "Growth", value: 80 },
					{ id: "equity-japan-value", name: "Value", value: 60 },
				],
			},
			{
				id: "equity-us",
				name: "US",
				children: [
					{ id: "equity-us-megacap", name: "Mega Cap", value: 120 },
					{ id: "equity-us-dividend", name: "Dividend", value: 55 },
				],
			},
		],
	},
	{
		id: "fixed-income",
		name: "Fixed Income",
		children: [
			{ id: "fi-gov", name: "Government", value: 95 },
			{ id: "fi-corp", name: "Corporate", value: 70 },
		],
	},
	{
		id: "alternatives",
		name: "Alternatives",
		children: [
			{ id: "alt-reit", name: "REIT", value: 42 },
			{ id: "alt-infra", name: "Infrastructure", value: 35 },
		],
	},
];

export const sankeyData: SankeyData = {
	nodes: [
		{ id: "cash", name: "Cash In" },
		{ id: "revenue", name: "Revenue" },
		{ id: "cost", name: "Cost" },
		{ id: "tax", name: "Tax" },
		{ id: "profit", name: "Profit" },
	],
	links: [
		{ sourceId: "cash", targetId: "revenue", value: 1000 },
		{ sourceId: "revenue", targetId: "cost", value: 520 },
		{ sourceId: "revenue", targetId: "tax", value: 110 },
		{ sourceId: "revenue", targetId: "profit", value: 370 },
	],
};

export const largeNumberLineData: ChartRecord[] = [
	{ period: "Q1", value: 1_240_000_000 },
	{ period: "Q2", value: 1_520_000_000 },
	{ period: "Q3", value: 1_410_000_000 },
	{ period: "Q4", value: 1_900_000_000 },
];

export const negativeValueBarData: ChartRecord[] = [
	{ label: "Alpha", score: 42 },
	{ label: "Beta", score: -18 },
	{ label: "Gamma", score: 25 },
	{ label: "Delta", score: -11 },
];

export const longLabelData: ChartRecord[] = [
	{
		label: "Extremely Long Category Label for Market Segment A",
		value: 48,
	},
	{
		label: "Another Very Long Label for Segment B",
		value: 31,
	},
	{
		label: "Long Label C",
		value: 21,
	},
];

export const sparseLineData: ChartRecord[] = [
	{ period: "1", value: 100 },
	{ period: "2", value: null },
	{ period: "3", value: 140 },
	{ period: "4", value: null },
	{ period: "5", value: 180 },
];
