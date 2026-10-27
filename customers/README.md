# customers/

One folder per customer. The templates in `packages/templates` never change per
customer — only these folders do.

```
customers/
  _template/          copied by `pnpm new:customer`
  demo-qingguang/     business kit demo
    content.ts        everything the visitor sees
    site.json         slug, kit, domain, Cloudflare project
    images-source/    originals, gitignored — logo/ hero/ gallery/ thumbnail/
    images/           optimized output, committed, served as /images/<category>/<file>
```

## Adding a customer

```bash
pnpm new:customer wanglai-cafe business   # business | restaurant | event | education | portfolio
# edit customers/wanglai-cafe/content.ts
# drop photos into customers/wanglai-cafe/images-source/
pnpm dev:customer wanglai-cafe
```

## Letting the customer edit from Google Sheets

```bash
pnpm sheet:template wanglai-cafe          # → customers/wanglai-cafe/sheet-template/*.csv
```

Import each CSV as a tab of one Google Sheet, publish each tab as CSV, and paste
the links into `site.sheets.sources` in `content.ts`. Steps and column
reference: `docs/GOOGLE_SHEETS_CONTENT.md`.

## Photos

Drop originals into the sub-folder that matches how they will be used, then:

```bash
pnpm images wanglai-cafe
```

| folder | max size | max file |
|---|---|---|
| `logo/` | 800 × 800 | 300 KB |
| `hero/` | 1920 × 1080 | 500 KB |
| `gallery/` | 1600 × 1200 | 400 KB |
| `thumbnail/` | 800 × 600 | 200 KB |

JPEG and PNG become WebP; existing WebP and SVG are copied through. EXIF
rotation is applied, images smaller than the limit are never enlarged, and the
script prints a `gallery` array you can paste straight into `content.ts`.

`images/` is wiped and rebuilt on every run, so it is only ever a product of
`images-source/`. If `images-source/` is missing the script does nothing at all
rather than deleting work it cannot recreate.

## Building one

```bash
pnpm build:customer wanglai-cafe
pnpm customers                            # list everything on file
```

## How it works

`use-customer.mjs` resolves the customer's Google Sheet tabs (if wired) onto
`content.ts`, writes the result into the app as `content.generated.ts`,
and syncs `images/` into the app's `public/images`. Both are gitignored — the
customer folder is the source of truth, the app is scratch space.

The image folder is deleted before each copy, so one customer's photos can
never end up in another customer's build.

## What does not belong here

Contracts, quotes, invoices, contact people, passwords. This folder is under
version control and its contents become a public website. Anything that is
about running the business rather than rendering the site belongs somewhere
else.
