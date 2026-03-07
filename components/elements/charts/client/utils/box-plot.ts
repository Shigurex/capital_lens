import type { BoxPlotDatum } from "@/components/elements/charts/client/types";

export function isBoxPlotDatumValid(datum: BoxPlotDatum): boolean {
	if (!Number.isFinite(datum.min)) return false;
	if (!Number.isFinite(datum.q1)) return false;
	if (!Number.isFinite(datum.median)) return false;
	if (!Number.isFinite(datum.q3)) return false;
	if (!Number.isFinite(datum.max)) return false;
	if (
		!(
			datum.min <= datum.q1 &&
			datum.q1 <= datum.median &&
			datum.median <= datum.q3 &&
			datum.q3 <= datum.max
		)
	) {
		return false;
	}
	if (datum.outliers) {
		for (const outlier of datum.outliers) {
			if (!Number.isFinite(outlier)) {
				return false;
			}
		}
	}
	return true;
}

export function validateBoxPlotData(data: BoxPlotDatum[]) {
	const invalid = data.filter((datum) => !isBoxPlotDatumValid(datum));
	return {
		valid: invalid.length === 0,
		invalid,
	};
}

export function getBoxPlotDomain(data: BoxPlotDatum[]): [number, number] {
	if (data.length === 0) {
		return [0, 1];
	}

	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const datum of data) {
		min = Math.min(min, datum.min, ...(datum.outliers ?? []));
		max = Math.max(max, datum.max, ...(datum.outliers ?? []));
	}

	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return [0, 1];
	}

	if (min === max) {
		return [min - 1, max + 1];
	}

	const padding = (max - min) * 0.1;
	return [min - padding, max + padding];
}
