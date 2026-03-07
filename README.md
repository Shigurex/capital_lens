This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Task Runner

This repository includes a `Taskfile.yml` for common development operations.

```bash
task setup          # install dependencies
task dev            # start Next.js dev server
task build          # build app
task start          # start production server (build runs first)
task cloudflare:dev -- src/index.ts # start wrangler local server
task check          # run ESLint + Biome check
task biome:fix      # run Biome fixes
task biome:format   # format with Biome
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local D1

This project includes a local D1 setup via [wrangler.toml](/Users/takata_shunya/capital_lens/wrangler.toml). Use the `DB` binding for local commands.

Apply the schema locally:

```bash
pnpm exec wrangler d1 execute DB --local --file=./db/migrations/date_20260306_initial_schema.sql
```

List local tables:

```bash
pnpm exec wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Insert a sample row:

```bash
pnpm exec wrangler d1 execute DB --local --command="INSERT INTO symbols (code, platform, name) VALUES ('7203', 'TSE', 'Toyota Motor');"
pnpm exec wrangler d1 execute DB --local --command="SELECT * FROM symbols;"
```

Load test data from the seed file:

```bash
pnpm exec wrangler d1 execute DB --local --file=./db/seeds/testdata.sql
```

Check the inserted data:

```bash
pnpm exec wrangler d1 execute DB --local --command="SELECT * FROM users;"
pnpm exec wrangler d1 execute DB --local --command="SELECT * FROM symbols;"
pnpm exec wrangler d1 execute DB --local --command="SELECT * FROM symbol_bookmarks;"
```

Notes:

- `--local` uses a separate local database under `.wrangler/` and does not affect the remote D1 database.
- `.wrangler/` is local state and should not be committed.
- For remote execution, replace `--local` with `--remote`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
