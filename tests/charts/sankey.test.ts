import { describe, expect, it } from "vitest";

import { toRechartsSankeyData } from "@/components/elements/charts/client/utils/sankey";

describe("toRechartsSankeyData", () => {
	it("converts id-based links to index-based links", () => {
		const converted = toRechartsSankeyData({
			nodes: [
				{ id: "a", name: "A" },
				{ id: "b", name: "B" },
			],
			links: [{ sourceId: "a", targetId: "b", value: 10 }],
		});

		expect(converted.nodes).toHaveLength(2);
		expect(converted.links).toEqual([{ source: 0, target: 1, value: 10 }]);
	});

	it("drops invalid links", () => {
		const converted = toRechartsSankeyData({
			nodes: [{ id: "a", name: "A" }],
			links: [{ sourceId: "a", targetId: "missing", value: 5 }],
		});

		expect(converted.links).toHaveLength(0);
	});
});
