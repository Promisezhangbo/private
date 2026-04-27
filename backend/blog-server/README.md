# blog-server

`blog-server` is a small Node.js backend for the blog app. The request handler is written against the standard Fetch API so the same logic can run locally with Node.js and on Deno Deploy.

## Scripts

```bash
pnpm --filter blog-server dev
pnpm --filter blog-server build
pnpm --filter blog-server start
```

For local Deno parity:

```bash
deno task dev
deno task check
```

## Deno Deploy

Create or update the project from <https://console.deno.com/promisezhangbo> with these settings:

- Project name: `blog-server`
- Entry point: `backend/blog-server/src/deno.js`
- Install/build command: leave empty
- Environment variables: add only the variables required by future API integrations

`src/deno.js` uses `Deno.serve(handleRequest)`, which is the runtime entry Deno Deploy expects. `src/node.js` is only for local Node.js execution.
