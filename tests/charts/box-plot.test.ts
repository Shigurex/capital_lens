import { describe, expect, it } from "vitest";

import {
	isBoxPlotDatumValid,
	validateBoxPlotData,
} from "@/components/elements/charts/client/utils/box-plot";

describe("box-plot validation", () => {
	it("accepts valid quartile order", () => {
		expect(
			isBoxPlotDatumValid({
				category: "A",
				min: 1,
				q1: 2,
				median: 3,
				q3: 4,
				max: 5,
			}),
		).toBe(true);
	});

	it("rejects invalid quartile order", () => {
		expect(
			isBoxPlotDatumValid({
				category: "B",
				min: 1,
				q1: 3,
				median: 2,
				q3: 4,
				max: 5,
			}),
		).toBe(false);
	});

	it("returns invalid list", () => {
		const result = validateBoxPlotData([
			{ category: "A", min: 1, q1: 2, median: 3, q3: 4, max: 5 },
			{ category: "B", min: 1, q1: 3, median: 2, q3: 4, max: 5 },
		]);

		expect(result.valid).toBe(false);
		expect(result.invalid).toHaveLength(1);
	});
});
