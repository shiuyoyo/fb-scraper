# EvalyCloud Product Bible v1.1

**Status:** Approved baseline  
**Primary Product:** Website Kits  
**First Release Products:** Business Website Kit + Event Website Kit  
**Priority:** First paying customer

> Simple tools. Real business.  
> 讓中小企業用最少的時間，把生意搬到網路上。

## 0. Executive Summary

EvalyCloud Website Kits is a productized website system for small businesses, independent professionals, educators, event organizers, and agencies. It provides reusable templates, shared components, mobile-first layouts, Cloudflare deployment, and a future optional Google Sheets CMS.

在取得第一位付費客戶前，主產品固定為 Website Kits。新想法只能進入 Backlog，不得干擾目前 Sprint。

## 1. Vision

### Mission
Help small businesses launch online with simple, practical technology.

### Vision
Become the easiest business website and automation platform for small businesses.

### Core Principles
- Simple First
- Component First
- Mobile First
- Fast Deployment
- Customer Ownership
- Backlog Discipline

## 2. Product Strategy

### Website Kits
- Business
- Restaurant
- Event
- Education
- Portfolio

### Sequence
1. Sell templates.
2. Sell enhanced templates and deployment services.
3. Build SaaS features only after validation.

### Non-Goals for MVP
- AI website generation
- Customer dashboard
- Subscription billing
- Domain automation
- Blog CMS
- Marketplace
- Mobile app
- Complex database backend

## 3. Target Users
- Small business owners
- Restaurant owners
- Independent professionals
- Educators and course providers
- Agencies and freelancers

## 4. MVP Scope

The first release contains the **Business Website Kit** and **Event Website Kit**.

Required sections:
1. Navbar
2. Hero
3. About
4. Services
5. Gallery
6. FAQ
7. Contact
8. Footer

Acceptance criteria:
- Responsive at 375 px and common desktop widths
- Configurable from one content source
- No customer data hard-coded in reusable components
- Deployable from documented instructions
- Demonstrable in a 30–60 second video


### Event Website Kit MVP

The Event Website Kit is part of the first release. It is designed for one-day or multi-day events that need a dedicated page launched quickly and archived after completion.

Required sections:
1. Navbar
2. Event Hero — title, date, venue, status, registration CTA
3. Event Overview
4. Multi-day Schedule — supports Day 1 / Day 2 or date groups
5. Speakers / Activities
6. Venue and Transport
7. Registration / Contact
8. Announcements / FAQ
9. Sponsors / Partners (optional)
10. Footer / Archive State

Event-specific acceptance criteria:
- Supports at least two schedule groups
- Date, venue, registration, and event status are immediately visible
- Urgent announcements are editable without changing component code
- Registration can switch to closed status
- Page can switch to recap/archive mode after the event
- Template can be reused by replacing structured content

## 5. EvalyCloud Marketing Website

Pages:
- Home
- Website Kits
- Pricing
- Demo
- FAQ
- About
- Login (Coming Soon)

## 6. Content Strategy

MVP uses local structured data first. Google Sheets is added after the reusable template is stable.

Google Sheets rules:
- Optional, not mandatory for first release
- Documented columns
- No secrets or private data in public sheets
- Fallback state required
- Restaurant availability may use TRUE/FALSE

## 7. Design System

- Primary: `#2563EB`
- Secondary: `#38BDF8`
- Accent: `#06B6D4`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- English font: Inter
- Chinese font: Noto Sans TC
- Radius: 12 px
- Spacing: 8 / 16 / 24 / 32 / 48 / 64

Components:
Button, Container, Section, SectionTitle, Navbar, Hero, Card, Gallery, FAQAccordion, ContactBlock, PricingCard, Footer.

## 8. Technical Architecture

- Next.js
- TypeScript
- Tailwind CSS
- Cloudflare
- GitHub monorepo
- pnpm recommended
- Local structured data first
- Google Sheets enhancement later

## 9. Commercial Model

Tier names are fixed:
- Creator
- Business
- Agency
- Cloud (future SaaS)

Exact prices remain to be validated through initial sales.

## 10. Roadmap

- Sprint 0: Product baseline
- Sprint 1: Shared foundation + Business Kit MVP
- Sprint 2: Event Kit MVP + deployment package
- Sprint 3: Sales readiness
- Sprint 4: First customer delivery
- Sprint 5: Google Sheets enhancement
- Later: Restaurant, Event, Education, Portfolio

## 11. Governance

Only one product focus may be active. New ideas go to Backlog.

Any meaningful feature requires an RFC:

```text
RFC-XXX
Title:
Problem:
Target User:
Proposed Solution:
In Scope:
Out of Scope:
Acceptance Criteria:
Risks:
Decision:
```

## 12. Go-to-Market

Primary goal: acquire the first paying customer.

Channels:
- Demo website
- Short video
- Direct outreach
- Build in Public after MVP
- Case study

## 13. Backlog

- AI Fortune
- YouTube Builder
- LINE Builder
- AI Content
- AI SEO
- AI Image
- Aura Scanner
- AI Website Builder
- Customer Dashboard
- Subscription Cloud Platform

## 14. Claude Development Brief

```text
You are implementing EvalyCloud Website Kits based on Product Bible v1.1.

1. Do not change product scope or architecture without an RFC.
2. Active products: Business Website Kit and Event Website Kit.
3. Use Next.js, TypeScript, Tailwind CSS, and reusable typed components.
4. Keep business content separate from UI components.
5. Business Kit: Navbar, Hero, About, Services, Gallery, FAQ, Contact, Footer. Event Kit: Navbar, Event Hero, Overview, Multi-day Schedule, Speakers/Activities, Venue, Registration/Contact, Announcements/FAQ, optional Sponsors, Footer/Archive State.
6. Build mobile-first and ensure keyboard accessibility.
7. Do not add authentication, billing, AI, dashboards, databases, or unrelated features.
8. Before coding, return implementation plan, file structure, assumptions, and acceptance checklist.
9. After coding, return files changed, run instructions, deployment instructions, and unresolved risks.
10. Stop and ask for approval if a change conflicts with this Product Bible.
```

## 15. Approved Baseline

| Decision | Approved Value |
|---|---|
| Brand | EvalyCloud |
| Primary Product | Website Kits |
| First Products | Business Website Kit + Event Website Kit |
| Categories | Business, Restaurant, Event, Education, Portfolio |
| Business MVP | Navbar, Hero, About, Services, Gallery, FAQ, Contact, Footer |
| Event MVP | Event Hero, Overview, Multi-day Schedule, Venue, Registration, Announcements, Archive State |
| Technology | Next.js, TypeScript, Tailwind CSS, Cloudflare, GitHub |
| Content | Local structured data first; Google Sheets later |
| Priority | First paying customer |
| Rule | No new product before validation |

**This document is the frozen baseline for Sprint 1–2.**
