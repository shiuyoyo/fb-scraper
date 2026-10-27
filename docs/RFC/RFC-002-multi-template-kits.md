# RFC-002: Multi-Template Kits, Delivered Foundation-First

**Status:** Approved, delivery in progress (5 of 15 templates available)
**Affects:** `packages/content-schema`, `packages/templates`, `packages/external-data`,
`customers/`, `scripts/`

## Note on provenance

Product Bible v1.1 defines two kits and their section lists. It does **not**
specify how many templates each kit has. The six-template plan below is a
product decision recorded here for the first time, not a pre-existing
requirement being recovered. This RFC is the source of that decision; the
Product Bible is unchanged.

## Problem

One kit with one fixed layout means every customer's site looks the same. A
restaurant and a law firm need different visual hierarchies, not just different
colors. But building several layouts before the shared foundation is stable
means every schema change, accessibility fix, and responsive adjustment has to
be made once per template.

## Decision

**Fifteen templates are the product plan** (expanded from six; recorded here,
not in the Product Bible):

| Kit | Templates |
|---|---|
| Business | `classic` ✅, `visual`, `minimal` |
| Restaurant | `classic` ✅, `visual`, `minimal` |
| Event | `classic` ✅, `festival`, `minimal` |
| Education | `classic` ✅, `playful`, `minimal` |
| Portfolio | `classic` ✅, `visual`, `minimal` |

Kit = an industry type with its own content structure. Template = a visual
variant within a kit. A kit's templates are type-constrained: `event/festival`
is valid, `business/festival` is not.

**Delivery is split into two phases.** The scope is not reduced — the sequence
is changed so that the four remaining templates are built against a foundation
that has already survived a real build, rather than in parallel with it.

### Delivered so far

- `business/classic`, `event/classic` (earlier rounds)
- `restaurant/classic` — full independent kit: own schema, thirteen sections
- `education/classic` — own schema (courses, teachers, features,
  enrolment-by-link); for cram schools, language centres, studios
- `portfolio/classic` — own schema (projects, services, clients); work-forward
  layout for designers, photographers, studios
- Shared multi-source Google Sheet content layer (below)

Every kit now has one working classic template — all five are testable in a
browser. Google Sheet overrides are wired for restaurant; education and
portfolio use static content.ts for now (the layer is kit-agnostic and can be
extended to them when a customer needs it).

### Foundation (previous round)

- Shared schema: site metadata, contact, images, SEO, theme, sheet config, and
  kit/template selection declared once and composed per kit
- Template registry: one map from name to component, with a safe fallback and a
  build-time warning for names that are planned but not yet implemented
- Shared external data layer for published Google Sheets
- Event status resolver covering all five states
- `business/classic` — the existing eight-section template, renamed
- `event/classic` — completed from four sections to eleven

### Outstanding — twelve templates

`business/visual`, `business/minimal`, `restaurant/visual`, `restaurant/minimal`,
`event/festival`, `event/minimal`, `education/playful`, `education/minimal`,
`portfolio/visual`, `portfolio/minimal`.

Each is built the same way: one component file, one line in the registry. The
matrix (`templateStatus()`) reports these as `planned`; nothing marks them done.

## Google Sheet content layer

A build-time, multi-kit capability — not Event-only.

- A customer wires several published-CSV sources (site, menu, hours, faq,
  announcements, images), each optional and each failing independently.
- Reads happen **at build time** in a server component; templates never fetch.
  A sheet change reaches the live site on the next rebuild, not on page refresh.
- Precedence: typed local fallback → valid sheet override → schema-valid
  resolved content. A blank cell keeps the fallback; `__EMPTY__` clears a field
  on purpose; an invalid value or a broken source never overwrites good
  fallback; one bad row is skipped, not fatal.
- The site only ever holds **public** content; no members, orders, or payments.

### Why build-time, not front-end fetch

The original request asked for the browser to read the sheet live. That was
evaluated and declined for this release: front-end fetch requires client
JavaScript (the site is currently zero-JS and fully static), exposes the CSV URL
in the bundle, and hits CORS limits on published sheets. Build-time reads keep
the site static, keep the bundle clean, and avoid CORS. "Live editing" is
delivered as "edit the sheet, trigger a rebuild" — see CUSTOMER_DEPLOYMENT.md.
Front-end fetch is a Backlog item, not cancelled.

## Delivery and ownership

- Customers use their own Google and Cloudflare accounts; the developer operates
  them at setup via a scoped token, never a password.
- The standard plan delivers a finished site and usage rights, not the repo or
  source. Source delivery is a separate, separately-priced agreement.
- Details in SERVICE_DELIVERY_MODEL.md and CUSTOMER_DEPLOYMENT.md.

## (superseded) original phase 2 note

## Why phase, rather than build all six now

Adding a template is a pure addition once the registry and schema exist: one
file and one line. There is no cost to deferring it, unlike the design token
work in RFC-001, where postponing would have meant reworking every section.

The cost of not deferring is real: four extra layouts multiply every subsequent
change to a shared section by five, before any customer has stated a preference.

## In Scope (phase 1)

- `template` field on both kits' `site`, typed per kit
- `templateRegistry` with `resolveBusinessTemplate` / `resolveEventTemplate`
- `BusinessKit` / `EventKit` entry components
- Event schema additions: `speakers`, `sponsors`, `faq`, `labels`
- `@evalycloud/external-data`: CSV parsing, fetch, mapping, coercion, fallback
- `resolveStatus` for the five event states
- `pnpm new:customer <slug> <kit> <template>`

## Out of Scope (phase 1)

- The four remaining templates
- Any new kit. Product Bible v1.1 defines two; none others are planned here.
- Customer-facing dashboard, login, database
- Live Google Sheet reads for the Business kit — the layer supports it, no
  template consumes it yet

## Acceptance Criteria

- Both kits resolve a template by name from content
- An unimplemented or unknown name falls back to `classic` and warns at build
- Templates receive resolved data; no component fetches
- A failed, un-published, or malformed sheet never breaks a build
- Event status changes what renders, including hiding registration once past
- Switching customer leaves no images or generated content behind
- `pnpm dev` with no arguments still works
- typecheck, lint, test and build all pass

## Risks

- **Marking phase 1 as "six templates done" would be false.** Four templates
  remain unbuilt. `plannedBusinessTemplates` / `plannedEventTemplates` in the
  registry are the machine-readable record of what is outstanding.
- Live status from a spreadsheet may only move a page to a stricter state
  (open → closed → completed → archived) and never back. A stale cell reading
  "open" on a cancelled event would send people to a venue for nothing.
- Static export bakes sheet values in at build time. "Live" means "as of the
  last build" unless a rebuild is triggered.
- The two demo customers exercise `classic` only. Phase 2 needs a demo per
  template.

## Risks

- A published Sheet's CSV URL is visible to anyone who has it; it holds only
  public content, but it is not secret.
- Some column formats and mappings can be inferred from a shipped bundle.
- A public front end cannot be fully protected from being copied.
- If a customer deletes or renames sheet tabs/headers, they may need help; the
  site falls back safely in the meantime.
- External image URLs can go dead; the site falls back to placeholders.
- A sheet that is temporarily unreachable shows fallback content until it
  recovers and the site rebuilds.
- Real-device mobile review is still a manual step.

These are accepted, with documented fallbacks.

## Decision Log

- Matrix expanded to 5 kits × 3 templates = 15, recorded here (not the Bible).
- Available: all five kits' `classic` templates (business, restaurant, event, education, portfolio).
- Google Sheet layer: build-time, multi-source, multi-kit. Front-end live fetch
  declined for this release (static + bundle-clean + CORS); Backlog.
- Delivery: customer-owned accounts, no repo/source in the standard plan.
- Product Bible unchanged.
- Ten templates remain `planned`. **Not to be marked complete now.**
- Next recommended: `restaurant/visual` — Restaurant is the kit with live
  demand and a photo-forward variant is its most-requested differentiator.
