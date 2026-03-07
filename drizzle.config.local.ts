import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

const D1_LOCAL_DIR = resolve(
	process.cwd(),
	".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
);

const findLatestLocalSqlite = () => {
	if (!existsSync(D1_LOCAL_DIR)) {
		return undefined;
	}

	const sqliteFiles = readdirSync(D1_LOCAL_DIR)
		.filter((file) => file.endsWith(".sqlite"))
		.map((file) => {
			const fullPath = resolve(D1_LOCAL_DIR, file);
			return {
				path: fullPath,
				mtime: statSync(fullPath).mtimeMs,
			};
		})
		.sort((a, b) => b.mtime - a.mtime);

	return sqliteFiles[0]?.path;
};

const localDbPath = process.env.D1_LOCAL_DB_PATH ?? findLatestLocalSqlite();

if (!localDbPath) {
	throw new Error(
		[
			"Local D1 database file was not found.",
			"Run one local D1 command first to initialize it, for example:",
			'pnpm exec wrangler d1 execute DB --local --command="SELECT 1;"',
			"Then run: pnpm db:studio:local",
		].join("\n"),
	);
}

export default defineConfig({
	dialect: "sqlite",
	dbCredentials: {
		url: localDbPath,
	},
});
