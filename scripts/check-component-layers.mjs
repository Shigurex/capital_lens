import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const componentsRoot = path.join(projectRoot, "components");

const layerOrder = ["ui", "elements", "blocks", "layouts"];
const allowedImports = {
	ui: new Set(["ui"]),
	elements: new Set(["ui", "elements"]),
	blocks: new Set(["ui", "elements", "blocks"]),
	layouts: new Set(["ui", "elements", "blocks", "layouts"]),
};

function walk(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	let files = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) {
			continue;
		}
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files = files.concat(walk(fullPath));
		} else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
			files.push(fullPath);
		}
	}
	return files;
}

function getLayer(filePath) {
	const rel = path.relative(componentsRoot, filePath);
	const [layer] = rel.split(path.sep);
	return layerOrder.includes(layer) ? layer : null;
}

function findImportTargets(content) {
	const imports = [];
	const regex = /from\s+["'](@\/components\/[^"']+)["']/g;
	for (const match of content.matchAll(regex)) {
		imports.push(match[1]);
	}
	return imports;
}

function targetLayer(importPath) {
	const stripped = importPath.replace("@/components/", "");
	const [layer] = stripped.split("/");
	return layerOrder.includes(layer) ? layer : null;
}

const errors = [];
for (const file of walk(componentsRoot)) {
	const sourceLayer = getLayer(file);
	if (!sourceLayer) {
		continue;
	}
	const content = fs.readFileSync(file, "utf8");
	const targets = findImportTargets(content);
	for (const target of targets) {
		const targetL = targetLayer(target);
		if (!targetL) {
			continue;
		}
		if (!allowedImports[sourceLayer].has(targetL)) {
			errors.push(
				`${path.relative(projectRoot, file)} imports ${target} (violates ${sourceLayer} -> ${targetL})`,
			);
		}
	}
}

if (errors.length > 0) {
	console.error("Component layer violations detected:\n");
	for (const err of errors) {
		console.error(`- ${err}`);
	}
	process.exit(1);
}

console.log("Component layer check passed.");
