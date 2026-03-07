import { describe, expect, it } from "vitest";

import { buildWaterfallPoints } from "@/components/elements/charts/client/utils/waterfall";

describe("buildWaterfallPoints", () => {
	it("builds cumulative points correctly", () => {
		const points = buildWaterfallPoints([
			{ label: "Start", delta: 100, type: "total" },
			{ label: "Up", delta: 20, type: "change" },
			{ label: "Down", delta: -10, type: "change" },
			{ label: "Subtotal", delta: 0, type: "subtotal" },
		]);

		expect(points).toHaveLength(4);
		expect(points[1]?.start).toBe(100);
		expect(points[1]?.end).toBe(120);
		expect(points[2]?.start).toBe(120);
		expect(points[2]?.end).toBe(110);
		expect(points[3]?.start).toBe(0);
		expect(points[3]?.end).toBe(110);
	});
});
