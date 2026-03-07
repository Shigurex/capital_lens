import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const readDatabaseIdFromWrangler = () => {
	const wranglerTomlPath = resolve(process.cwd(), "wrangler.toml");
	const wranglerToml = readFileSync(wranglerTomlPath, "utf8");
	const matched = wranglerToml.match(/database_id\s*=\s*"([^"]+)"/);

	return matched?.[1];
};

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId =
	process.env.CLOUDFLARE_D1_DATABASE_ID ?? readDatabaseIdFromWrangler();
const token = process.env.CLOUDFLARE_D1_API_TOKEN;

if (!accountId) {
	throw new Error("CLOUDFLARE_ACCOUNT_ID is required.");
}

if (!databaseId) {
	throw new Error(
		"CLOUDFLARE_D1_DATABASE_ID is required (or set database_id in wrangler.toml).",
	);
}

if (!token) {
	throw new Error("CLOUDFLARE_D1_API_TOKEN is required.");
}

export default defineConfig({
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId,
		databaseId,
		token,
	},
});
