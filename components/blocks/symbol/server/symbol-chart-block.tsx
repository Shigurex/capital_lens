import { SymbolChartPanel } from "@/components/blocks/symbol/client/symbol-chart-panel";
import type { SymbolChartPanelViewModel } from "@/components/blocks/symbol/types";

interface SymbolChartBlockProps {
	title: string;
	description?: string;
	viewModel: SymbolChartPanelViewModel;
}

export async function SymbolChartBlock({
	title,
	description,
	viewModel,
}: SymbolChartBlockProps) {
	return (
		<section className="w-full space-y-2">
			<div>
				<h2 className="text-base font-semibold text-foreground">{title}</h2>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			<SymbolChartPanel viewModel={viewModel} />
		</section>
	);
}
