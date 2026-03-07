import type { ChartColorScheme } from "@/components/elements/charts/client/types";

const CATEGORICAL_SERIES = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--chart-6)",
	"var(--chart-7)",
	"var(--chart-8)",
];

const FINANCIAL_SERIES = [
	"var(--chart-positive)",
	"var(--chart-negative)",
	"var(--chart-neutral)",
	"var(--chart-1)",
	"var(--chart-2)",
];

const NEUTRAL_SERIES = [
	"var(--chart-neutral)",
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
];

export const chartSemanticColors = {
	positive: "var(--chart-positive)",
	negative: "var(--chart-negative)",
	neutral: "var(--chart-neutral)",
	total: "var(--chart-total)",
	border: "var(--border)",
};

function normalizeToken(token: string): string {
	if (token.startsWith("var(")) {
		return token;
	}
	if (token.startsWith("--")) {
		return `var(${token})`;
	}
	return token;
}

export function resolveSeriesColor(
	index: number,
	colorToken?: string,
	colorScheme: ChartColorScheme = "categorical",
): string {
	if (colorToken) {
		return normalizeToken(colorToken);
	}

	const palette =
		colorScheme === "financial"
			? FINANCIAL_SERIES
			: colorScheme === "neutral"
				? NEUTRAL_SERIES
				: CATEGORICAL_SERIES;

	return palette[index % palette.length];
}
