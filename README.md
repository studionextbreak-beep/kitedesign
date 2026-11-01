# Kite

A Canva-style design studio in the browser: a marketing site, a template gallery,
a dashboard for your work, and a real canvas editor with layers, snapping,
multi-page decks, presenter mode and PNG/PDF export.

Optional accounts: sign in with Freebuff and your designs sync to a Cloudflare D1
database through a small Worker API.

## Stack

- React 19 + TypeScript, Vite 6
- Tailwind CSS 4
- `html-to-image` + `jspdf` for exports
- Optional backend: Cloudflare Worker, D1, [`@freebuff/auth`](https://www.npmjs.com/package/@freebuff/auth)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # typecheck + production build
npm run typecheck  # tsc only
```

The app runs entirely client-side without a backend: designs persist in
`localStorage` and the account UI shows "Local workspace".

## Project layout

```
src/pages/        Landing, Templates, Dashboard, Pricing, Editor
src/editor/       Canvas, inspector, side panels, presenter, renderer
src/lib/          Design model, templates, storage, cloud sync, constants
worker/           Fetch handler: auth routes, /api/designs, D1 schema
sites.manifest.json  Worker + static-asset deploy manifest
wrangler.dev.jsonc   Local workerd config (development auth client)
```

## Cloud sync

- `GET /api/designs` returns the signed-in user's designs.
- `PUT /api/designs/:id` upserts one design (2 MB cap, same-origin only).
- `DELETE /api/designs/:id` removes it.
- Rows are keyed on the session's `sub`; ownership is never taken from the request.
- The `designs` table is created on first API call.

Build and deploy:

```bash
npm run build:cloud   # dist/ + worker-dist/worker.js
```

Deploy the manifest with your hosting tool. The platform injects
`FREEBUFF_CLIENT_ID`, `FREEBUFF_ISSUER` and `APP_ORIGIN`; no secrets live in the
repository.

## Local Workers testing

```bash
npm run build:cloud
npx wrangler dev --config wrangler.dev.jsonc --port 8787
```

`wrangler.dev.jsonc` uses the development auth client and
`http://localhost:8787`. `allowInsecureLocalhost` is enabled by the Worker only
when `APP_ORIGIN` is a loopback address, so deployed builds never use it.

## Notes

- Stock photos are fetched from `picsum.photos` and need a connection; templates
  degrade gracefully without them.
- Uploads are embedded in the design data, so very large images may not sync.
