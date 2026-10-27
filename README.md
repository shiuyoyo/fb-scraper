# EvalyCloud Website Kits

Sprint 1 foundation for:

- EvalyCloud marketing site
- Business Website Kit demo
- Event Website Kit demo
- Shared UI components
- Shared typed content schemas
- Reusable template components

## Requirements

- Node.js 20+
- pnpm 9+

## Install

```bash
pnpm install
```

## Run all apps

```bash
pnpm dev
```

Default local ports:

- Marketing site: http://localhost:3000
- Business Kit demo: http://localhost:3001
- Restaurant Kit demo: http://localhost:3003
- Education Kit demo: http://localhost:3004
- Portfolio Kit demo: http://localhost:3005
- Event Kit demo: http://localhost:3002

## Build

```bash
pnpm build
```

## Kits and templates

Five kits, three templates each — fifteen planned, five available (RFC-002).
`pnpm customers` and the registry's `templateStatus()` report live status.

| kit | templates |
|---|---|
| business | classic ✅ · visual · minimal |
| restaurant | classic ✅ · visual · minimal |
| event | classic ✅ · festival · minimal |
| education | classic ✅ · playful · minimal |
| portfolio | classic ✅ · visual · minimal |

Planned templates are refused by the scaffold and never counted as done.

## Delivery

- `docs/SERVICE_DELIVERY_MODEL.md` — what the standard plan includes
- `docs/CUSTOMER_DEPLOYMENT.md` — deploying to a customer's Cloudflare
- `docs/GOOGLE_SHEETS_CONTENT.md` — how a customer edits content

## Tests

```bash
pnpm test
```

## Customers

One folder per customer under `customers/`. The templates never change per
customer — only the content does. See `customers/README.md`.

```bash
pnpm customers                            # list every customer on file
pnpm new:customer <slug> <kit> <template> # scaffold a new one
pnpm dev:customer <slug>                  # run one locally
pnpm build:customer <slug>                # build one
pnpm images <slug>                        # optimize that customer's photos
```

## Current Sprint

Sprint 1:

- Shared monorepo foundation
- Business Kit MVP foundation
- Event Kit MVP foundation

See `docs/Product_Bible.md` and `CLAUDE.md` before making changes.
