# Customer Deployment

How a finished site gets onto a customer's own Cloudflare account. Written for
the developer doing the delivery.

## Accounts belong to the customer

- Google account and Google Sheet: the customer's
- Cloudflare account and Pages project: the customer's
- Domain: the customer's

You operate the customer's Cloudflare during setup using a **scoped API token**
they generate for you, never their password. Revoke it (or have them revoke it)
when setup is done or the relationship ends.

## Building the customer's site

```bash
pnpm build:customer <slug>
```

For a static upload you also need the app to emit an `out/` folder. Add to that
app's `next.config.ts`:

```ts
output: "export",
images: { unoptimized: true },
trailingSlash: true,
```

Then the build output is `apps/<kit>-kit-demo/out/`. (Without `output: "export"`
the build stays server-capable and Vercel-deployable — see the trade-off note at
the end.)

## Deploying — three routes, pick per customer

The routes differ only in **who triggers the build and where it runs**. The
application code is identical for all three.

### Route A — Direct Upload (simplest, most private)

The customer's Cloudflare has no repository and no other customer's data.

```bash
npx wrangler pages deploy apps/<kit>-kit-demo/out --project-name=<customer-project>
```

- The developer runs this each time content changes.
- Cleanest possible customer account; nothing of yours is exposed.
- Trade-off: the customer cannot trigger their own update — they ask you, or you
  automate it on your side.

### Route B — private repo + Deploy Hook (customer can self-update)

Connect the customer's Pages project to a **private** GitHub repo on a clean,
dedicated GitHub account. Cloudflare builds from it; a Deploy Hook URL triggers
rebuilds.

- The customer sees deployment results and build logs, **not** source — a
  private repo stays closed to them.
- The customer (or a button, or their sheet via a webhook) can trigger a
  rebuild by POSTing the Deploy Hook URL.
- Trade-offs, all real:
  - The monorepo contains **every** customer. A repo the customer's Cloudflare
    can build is a repo that mixes customers together. Prefer a per-customer
    repo or a build that checks out only one customer.
  - When authorising Cloudflare on GitHub, grant access to **that one repo
    only**, never the whole account.
  - A Deploy Hook URL needs no auth — anyone with it can trigger a build. Never
    expose it in a public page; put it behind something you control.
  - A Direct Upload project cannot later switch to Git integration, and vice
    versa. Choose the route before creating the project.

### Route C — a trigger Worker (self-update without a customer-side repo)

The customer's account stays pure Direct Upload. A small Worker you host takes
the customer's "update" request, builds their site on your side, and uploads it.

- Customer account is clean like Route A; customer can self-trigger like Route B.
- Trade-off: you build and maintain the Worker, and the first version is manual.

## Recommended sequence

1. Start every customer on **Route A**. It always works and exposes nothing.
2. Only when manual uploads become a real burden, move to B or C, chosen from
   how delivery actually feels by then.

## Domain and HTTPS

1. In the customer's Pages project → Custom domains → add their domain.
2. Point the domain's DNS at Cloudflare as instructed.
3. Cloudflare issues the certificate automatically; confirm HTTPS resolves
   before handing over.

## Google Sheet updates vs rebuilds

- Editing the sheet is instant, but the **live site** only changes on a rebuild,
  because the site is static and reads the sheet at build time.
- Which changes need a rebuild: **any** content change (sheet edits, new photos,
  text in `content.ts`). There is no change that appears without a rebuild.
- To confirm a site is reading a sheet correctly, rebuild and check the section
  that the sheet controls.

## The static trade-off (know this before choosing `output: "export"`)

Static export gives up server features. If a site later needs form handling,
per-request logic, or incremental revalidation, it must move off static export
(e.g. to OpenNext on Cloudflare, or a server host). For the current product —
public brochure sites that link out for anything transactional — static is the
right default, but the door is one-way per project.
