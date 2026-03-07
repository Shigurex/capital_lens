const decimalFormatter = new Intl.NumberFormat("ja-JP", {
	maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
	style: "currency",
	currency: "JPY",
	maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("ja-JP", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function formatNumber(value: number): string {
	return decimalFormatter.format(value);
}

export function formatCurrency(value: number): string {
	return currencyFormatter.format(value);
}

export function formatPercentFromRatio(value: number): string {
	return percentFormatter.format(value);
}

export function formatPercentFromValue(value: number): string {
	return percentFormatter.format(value / 100);
}

export function formatDateLabel(value: string | number | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}
	return dateFormatter.format(date);
}
