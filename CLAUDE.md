# EvalyCloud Development Instructions

You are implementing EvalyCloud Website Kits based on Product Bible v1.1.

## Frozen product scope

Five Website Kits, three templates each (15 total). The matrix and its
staged delivery are recorded in `docs/RFC/RFC-002-multi-template-kits.md`;
the machine-readable source of truth is `availableTemplates` in
`packages/templates/src/matrix.ts`.

| Kit | Templates |
|---|---|
| Business | classic ✅ · visual ⏳ · minimal ⏳ |
| Restaurant | classic ✅ · visual ⏳ · minimal ⏳ |
| Event | classic ✅ · festival ⏳ · minimal ⏳ |
| Education | classic ✅ · playful ⏳ · minimal ⏳ |
| Portfolio | classic ✅ · visual ⏳ · minimal ⏳ |

Five available, ten planned. A planned template must stay planned — never
silently fall back to classic and count as done.

Do not add a sixth Kit, and do not add unrelated products or platform
features. Read `docs/PROJECT_STATUS.md` before starting work.

## Technology

- Next.js
- TypeScript
- Tailwind CSS
- pnpm workspace
- Turborepo
- Cloudflare-compatible deployment
- Local structured content first
- Google Sheets integration later

## Architecture rules

1. Keep business and event content separate from UI components.
2. Use typed props and strict TypeScript.
3. Reuse components from `packages/ui`.
4. Reuse template sections from `packages/templates`.
5. Do not duplicate components across apps without an RFC.
6. Keep each demo app independently runnable.
7. Do not add authentication, billing, AI, databases, dashboards, or external CMS features.
8. Do not add a dependency unless it solves a documented requirement.
9. Preserve mobile-first behavior and keyboard accessibility.
10. Do not change the folder structure without approval.

## Business Kit scope

Implement only:

- Navbar
- Hero
- About
- Services
- Gallery
- FAQ
- Contact
- Footer

## Event Kit scope

Implement only:

- Navbar
- Event Hero
- Event Overview
- Multi-day Schedule
- Speakers / Activities
- Venue and Transport
- Registration / Contact
- Announcements / FAQ
- Sponsors / Partners (optional)
- Footer / Archive State

## Restaurant Kit scope

- Navbar
- Hero
- Restaurant introduction
- Featured dishes
- Menu categories and items
- Promotions / announcements
- Opening hours
- Location / transportation
- Reservation CTA (external links only — no booking backend)
- Gallery
- FAQ
- Footer

Menu prices keep `price` (number) and `priceLabel` (text such as 時價)
separate. Never coerce a label into a number; never emit NaN.

## Education Kit scope

- Navbar
- Hero
- About
- Features
- Courses
- Teachers
- Gallery
- FAQ
- Enrollment (external links only)
- Footer

## Portfolio Kit scope

- Navbar
- Hero
- Work / projects
- About
- Services
- Clients
- Contact
- Footer

## Before coding

Return:

1. Implementation plan
2. Files to be changed
3. Assumptions
4. Acceptance checklist
5. Risks or conflicts with Product Bible

## After coding

Return:

1. Files changed
2. Local run instructions
3. Build results
4. Deployment instructions
5. Remaining risks

Stop and request approval when a request conflicts with Product Bible v1.1.
