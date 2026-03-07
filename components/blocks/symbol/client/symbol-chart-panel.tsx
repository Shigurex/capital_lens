"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type {
	SymbolChartPanelViewModel,
	SymbolChartPayload,
	SymbolLineOrBarChartPayload,
	SymbolRadarChartPayload,
} from "@/components/blocks/symbol/types";
import { Button } from "@/components/ui/button";

const LineChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/line-chart-element").then(
			(mod) => mod.LineChartElement,
		),
	{ ssr: false },
);
const BarChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/bar-chart-element").then(
			(mod) => mod.BarChartElement,
		),
	{ ssr: false },
);
const PieChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/pie-chart-element").then(
			(mod) => mod.PieChartElement,
		),
	{ ssr: false },
);
const RadarChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/radar-chart-element").then(
			(mod) => mod.RadarChartElement,
		),
	{ ssr: false },
);
const TreemapChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/treemap-chart-element").then(
			(mod) => mod.TreemapChartElement,
		),
	{ ssr: false },
);
const SunburstChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/sunburst-chart-element").then(
			(mod) => mod.SunburstChartElement,
		),
	{ ssr: false },
);
const SankeyChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/sankey-chart-element").then(
			(mod) => mod.SankeyChartElement,
		),
	{ ssr: false },
);
const WaterfallChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/waterfall-chart-element").then(
			(mod) => mod.WaterfallChartElement,
		),
	{ ssr: false },
);
const BoxPlotChartElement = dynamic(
	() =>
		import("@/components/elements/charts/client/box-plot-chart-element").then(
			(mod) => mod.BoxPlotChartElement,
		),
	{ ssr: false },
);

interface SymbolChartPanelProps {
	viewModel: SymbolChartPanelViewModel;
}

function isSeriesChart(
	payload: SymbolChartPayload,
): payload is SymbolLineOrBarChartPayload | SymbolRadarChartPayload {
	return (
		payload.kind === "line" ||
		payload.kind === "bar" ||
		payload.kind === "radar"
	);
}

export function SymbolChartPanel({ viewModel }: SymbolChartPanelProps) {
	const rangeList = useMemo(() => {
		if (viewModel.rangeOrder && viewModel.rangeOrder.length > 0) {
			return viewModel.rangeOrder;
		}
		return Object.keys(viewModel.datasetsByRange);
	}, [viewModel.datasetsByRange, viewModel.rangeOrder]);

	const [selectedRange, setSelectedRange] = useState(
		viewModel.defaultRange ?? rangeList[0] ?? "",
	);

	const payload = viewModel.datasetsByRange[selectedRange];

	const [visibleSeriesKeys, setVisibleSeriesKeys] = useState<string[]>([]);

	useEffect(() => {
		if (payload && isSeriesChart(payload)) {
			setVisibleSeriesKeys(payload.series.map((series) => series.key));
		}
	}, [payload]);

	if (!payload) {
		return (
			<p className="text-sm text-muted-foreground">No chart data available.</p>
		);
	}

	const renderSeriesToggle =
		isSeriesChart(payload) && payload.series.length > 1 ? (
			<div className="mb-3 flex flex-wrap gap-2">
				{payload.series.map((series) => {
					const active = visibleSeriesKeys.includes(series.key);
					return (
						<Button
							key={series.key}
							type="button"
							size="xs"
							variant={active ? "default" : "outline"}
							onClick={() => {
								setVisibleSeriesKeys((prev) =>
									prev.includes(series.key)
										? prev.filter((key) => key !== series.key)
										: [...prev, series.key],
								);
							}}
						>
							{series.label}
						</Button>
					);
				})}
			</div>
		) : null;

	const filteredPayload = isSeriesChart(payload)
		? {
				...payload,
				series: payload.series.filter((series) =>
					visibleSeriesKeys.includes(series.key),
				),
			}
		: payload;

	const renderChart = (chartPayload: SymbolChartPayload) => {
		switch (chartPayload.kind) {
			case "line":
				return <LineChartElement {...chartPayload} />;
			case "bar":
				return <BarChartElement {...chartPayload} />;
			case "pie":
				return <PieChartElement {...chartPayload} />;
			case "radar":
				return <RadarChartElement {...chartPayload} />;
			case "treemap":
				return <TreemapChartElement {...chartPayload} />;
			case "sunburst":
				return <SunburstChartElement {...chartPayload} />;
			case "sankey":
				return <SankeyChartElement {...chartPayload} />;
			case "waterfall":
				return <WaterfallChartElement {...chartPayload} />;
			case "boxPlot":
				return <BoxPlotChartElement {...chartPayload} />;
			default:
				return null;
		}
	};

	return (
		<div className="w-full">
			{rangeList.length > 1 ? (
				<div className="mb-3 flex flex-wrap gap-2">
					{rangeList.map((range) => (
						<Button
							key={range}
							type="button"
							size="xs"
							variant={range === selectedRange ? "default" : "outline"}
							onClick={() => setSelectedRange(range)}
						>
							{range}
						</Button>
					))}
				</div>
			) : null}
			{renderSeriesToggle}
			{renderChart(filteredPayload)}
		</div>
	);
}
