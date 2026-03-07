import type { WaterfallDatum } from "@/components/elements/charts/client/types";

export interface WaterfallPoint {
	label: string;
	type: "change" | "subtotal" | "total";
	delta: number;
	start: number;
	end: number;
	base: number;
	span: number;
	direction: "positive" | "negative" | "total";
}

export function buildWaterfallPoints(
	input: WaterfallDatum[],
): WaterfallPoint[] {
	let running = 0;
	const points: WaterfallPoint[] = [];

	for (const item of input) {
		const type = item.type ?? "change";
		let start = running;
		let end = running;
		let delta = item.delta;
		let direction: WaterfallPoint["direction"] = "total";

		if (type === "change") {
			start = running;
			end = running + item.delta;
			delta = item.delta;
			running = end;
			direction = item.delta >= 0 ? "positive" : "negative";
		} else if (type === "subtotal") {
			start = 0;
			end = running;
			delta = running;
			direction = "total";
		} else {
			start = 0;
			end = item.delta;
			delta = item.delta;
			running = item.delta;
			direction = "total";
		}

		points.push({
			label: item.label,
			type,
			delta,
			start,
			end,
			base: Math.min(start, end),
			span: Math.abs(end - start),
			direction,
		});
	}

	return points;
}

export function getWaterfallDomain(points: WaterfallPoint[]): [number, number] {
	if (points.length === 0) {
		return [0, 1];
	}

	let min = 0;
	let max = 0;
	for (const point of points) {
		min = Math.min(min, point.start, point.end);
		max = Math.max(max, point.start, point.end);
	}

	if (min === max) {
		return [min - 1, max + 1];
	}

	const padding = (max - min) * 0.1;
	return [min - padding, max + padding];
}
