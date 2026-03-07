import type { SankeyData } from "@/components/elements/charts/client/types";

export interface RechartsSankeyPayload {
	nodes: Array<{ name: string; id: string }>;
	links: Array<{ source: number; target: number; value: number }>;
}

export function toRechartsSankeyData(data: SankeyData): RechartsSankeyPayload {
	const nodes = data.nodes.map((node) => ({
		id: node.id,
		name: node.name,
	}));

	const nodeIndex = new Map<string, number>();
	nodes.forEach((node, idx) => {
		nodeIndex.set(node.id, idx);
	});

	const links = data.links
		.map((link) => {
			const source = nodeIndex.get(link.sourceId);
			const target = nodeIndex.get(link.targetId);
			if (source === undefined || target === undefined || link.value <= 0) {
				return null;
			}
			return {
				source,
				target,
				value: link.value,
			};
		})
		.filter(
			(link): link is { source: number; target: number; value: number } =>
				link !== null,
		);

	return { nodes, links };
}
