import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChartElement } from "@/components/elements/charts/client/bar-chart-element";
import { BoxPlotChartElement } from "@/components/elements/charts/client/box-plot-chart-element";
import { LineChartElement } from "@/components/elements/charts/client/line-chart-element";
import { PieChartElement } from "@/components/elements/charts/client/pie-chart-element";
import { RadarChartElement } from "@/components/elements/charts/client/radar-chart-element";
import { SankeyChartElement } from "@/components/elements/charts/client/sankey-chart-element";
import {
	boxPlotData,
	lineAndBarData,
	pieData,
	radarData,
	sankeyData,
	sunburstData,
	treemapData,
	waterfallData,
} from "@/components/elements/charts/client/stories-data";
import { SunburstChartElement } from "@/components/elements/charts/client/sunburst-chart-element";
import { TreemapChartElement } from "@/components/elements/charts/client/treemap-chart-element";
import { WaterfallChartElement } from "@/components/elements/charts/client/waterfall-chart-element";

describe("chart components", () => {
	it("renders loading state", () => {
		render(
			<LineChartElement
				title="Line"
				data={lineAndBarData}
				xKey="period"
				series={[{ key: "revenue", label: "Revenue" }]}
				loading
			/>,
		);
		expect(screen.getByText("Loading chart...")).toBeInTheDocument();
	});

	it("renders error state", () => {
		render(
			<BarChartElement
				title="Bar"
				data={lineAndBarData}
				xKey="period"
				series={[{ key: "revenue", label: "Revenue" }]}
				errorMessage="error"
			/>,
		);
		expect(screen.getByText("error")).toBeInTheDocument();
	});

	it("renders major chart titles in normal state", () => {
		render(
			<div>
				<LineChartElement
					title="Line"
					data={lineAndBarData}
					xKey="period"
					series={[{ key: "revenue", label: "Revenue" }]}
				/>
				<BarChartElement
					title="Bar"
					data={lineAndBarData}
					xKey="period"
					series={[{ key: "revenue", label: "Revenue" }]}
				/>
				<PieChartElement
					title="Pie"
					data={pieData}
					nameKey="segment"
					valueKey="value"
				/>
				<RadarChartElement
					title="Radar"
					data={radarData}
					categoryKey="metric"
					series={[{ key: "current", label: "Current" }]}
				/>
				<TreemapChartElement title="Treemap" data={treemapData} />
				<SunburstChartElement title="Sunburst" data={sunburstData} />
				<SankeyChartElement title="Sankey" data={sankeyData} />
				<WaterfallChartElement title="Waterfall" data={waterfallData} />
				<BoxPlotChartElement title="BoxPlot" data={boxPlotData} />
			</div>,
		);

		expect(screen.getByText("Line")).toBeInTheDocument();
		expect(screen.getByText("Bar")).toBeInTheDocument();
		expect(screen.getByText("Pie")).toBeInTheDocument();
		expect(screen.getByText("Radar")).toBeInTheDocument();
		expect(screen.getByText("Treemap")).toBeInTheDocument();
		expect(screen.getByText("Sunburst")).toBeInTheDocument();
		expect(screen.getByText("Sankey")).toBeInTheDocument();
		expect(screen.getByText("Waterfall")).toBeInTheDocument();
		expect(screen.getByText("BoxPlot")).toBeInTheDocument();
	});
});
