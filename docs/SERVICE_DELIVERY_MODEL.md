# Service Delivery Model

How an EvalyCloud website is delivered, and where the boundaries sit. This is a
business document, not a technical one; it exists so that pricing, contracts,
and customer expectations line up with how the product actually works.

## What the standard plan delivers

- A finished website, built from the customer's chosen kit and template
- The right to use that website
- The customer's own Google Sheet for editing public content
- A short guide for operating that sheet (`GOOGLE_SHEETS_CONTENT.md`)
- The customer's own Cloudflare Pages project, on their own account
- The customer's own domain
- First-time deployment help

## What the standard plan does not include

- The monorepo or any source code
- A GitHub repository
- The TypeScript / React source
- Any other kit or template
- The customer scaffold or developer tooling
- Any other customer's data
- Any right to resell or re-license the templates

Customisation of a customer's own site does not, by itself, mean source code is
handed over. Source-code delivery is a separate agreement, separately priced.

## Who owns what

- **Content** — the customer's. Their words, prices, photos, and Google Sheet
  are theirs.
- **Templates and architecture** — the developer's. The kit system, the
  monorepo, and the fifteen-template matrix stay with EvalyCloud.
- **Accounts** — the customer's. Google account, Cloudflare account, and domain
  are registered to the customer. The developer may operate them during setup
  using a scoped API token, never the customer's password.

## What the product handles, and what it does not

The website shows **public information** and links out for anything
transactional. It is a brand homepage, a restaurant page, an event page, an
education or portfolio site — presentation and referral, not an application.

It does **not** handle: members, customer lists, orders, payments, credit
cards, private reservations, identity documents, account credentials, API keys,
or any non-public internal data. When a site needs booking, ordering, or
payment, it links to an external service (LINE, phone, Google Form, Accupass, a
booking platform, a payment platform). The site itself stores nothing private.
