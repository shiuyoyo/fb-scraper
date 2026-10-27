# RFC-001: Configurable Brand Color

**Status:** Approved and implemented
**Affects:** Product Bible v1.1 §7 (Design System), §4 (MVP acceptance criteria), `packages/content-schema`, `packages/config`, `packages/ui`, `packages/templates`

## Problem

Product Bible v1.1 §7 fixes a single primary color (`#2563EB`) for the whole design
system. A productized kit is sold to many customers, and a customer's brand color is
the most visible part of "their" website. Today the only ways to change it are to fork
the template or to rebuild Tailwind per customer — both break §4 ("Template can be
reused by replacing structured content") and slow down delivery.

Deciding this now is cheap. Sprint 1B is about to build eight sections; if brand color
becomes configurable afterwards, every section has to be reworked.

## Target User

- Small business owners and event organizers who already have a brand color
- EvalyCloud delivery: faster customization per sale, no code fork per customer

## Proposed Solution

Introduce a theme token layer between the design system and the components.

1. Colors in `packages/config/tailwind-preset.ts` resolve to CSS custom properties
   (`rgb(var(--color-primary) / <alpha-value>)`) instead of literal hex values.
   Tailwind class names stay identical (`bg-primary`, `text-accent`), so components
   never change again when a theme changes.
2. A curated set of named palettes ships with the kit. Each palette defines
   primary / primary-hover / secondary / accent and is contrast-checked once.
3. Content selects a palette: `site.theme?: ThemeName` in both
   `BusinessSiteContent` and `EventSiteContent`. Omitted means `blue`, so current
   demos are visually unchanged.
4. The selected palette is applied as CSS variables on the root element. No rebuild,
   no per-customer branch, no runtime dependency.

Semantic colors (success / warning / danger) stay fixed — they carry meaning, not brand.

## Palettes

Five palettes ship in v1. `ocean` is the default and reproduces the current Product
Bible look exactly, so existing demos are unchanged when `theme` is omitted.

| key | 顯示名稱 | primary | hover | accent | background | surface | foreground | border | 適合 |
|---|---|---|---|---|---|---|---|---|---|
| `ocean` | 專業海藍 | `#2563EB` | `#1D4ED8` | `#0E7490` | `#FFFFFF` | `#F8FAFC` | `#0F172A` | `#E2E8F0` | 科技、資訊服務、顧問、診所 |
| `forest` | 自然墨綠 | `#15803D` | `#166534` | `#4D7C0F` | `#FFFFFF` | `#F5F7F1` | `#1A2B20` | `#E3E9DE` | 有機食品、農產、環保、療癒、居家 |
| `ivory` | 象牙石板 | `#334155` | `#1E293B` | `#57534E` | `#FBFAF7` | `#F3F1EC` | `#1C1917` | `#E7E5E4` | 顧問、律師、攝影、婚紗、精品 |
| `terracotta` | 暖陶土 | `#C2410C` | `#9A3412` | `#B45309` | `#FFFDFB` | `#FDF4EC` | `#1F1A17` | `#EFE0D2` | 餐飲、咖啡、烘焙、市集、零售 |
| `plum` | 質感紫 | `#6D28D9` | `#5B21B6` | `#7E22CE` | `#FFFFFF` | `#FAF7FF` | `#1E1B2E` | `#E9E3F5` | 美業、美妝、課程、講座、藝文 |

Every value above is contrast-checked: white text on primary / hover / accent and
foreground on background / surface all reach WCAG AA (≥ 4.5:1). Lowest measured ratio
across the set is 4.99:1.

Semantic colors (success `#22C55E`, warning `#F59E0B`, danger `#EF4444`) are fixed and
do not follow the brand. Documented so a red-branded customer keeps a meaningful
error state.

## In Scope

- `ThemeName` type and palette definitions
- Background / surface / foreground / border tokens, not only brand colors — the
  reference examples the palettes are drawn from are driven by their neutrals
  (ivory, cream, charcoal) as much as by their brand color
- Optional `site.theme` field in both content schemas
- Preset rewritten to variable-based color tokens
- Replace remaining hard-coded `blue-600` / `cyan-600` in `packages/ui` and
  `packages/templates` with tokens
- Documentation of available palettes for the sales demo

## Out of Scope

- Color picker or any customer-facing UI
- Customer dashboard or stored settings
- Per-section or per-component color overrides
- Dark mode
- Configurable fonts, radius, or spacing
- Free-form hex input (see Decision below)
- Dark-background palettes such as black-and-gold. Gold `#D4AF37` scores 2.1:1 on
  white and only works on a dark canvas, which needs a dark surface mode. Backlog.
- Per-customer fonts, radius, spacing, or section order

## Acceptance Criteria

- Default output is pixel-identical to the current demos when `theme` is omitted
- Changing one field in the content source restyles the entire site
- No rebuild or config change is required to switch palette
- Body and button text meet WCAG AA contrast on every shipped palette
- No brand hex value remains hard-coded in `packages/ui` or `packages/templates`
- `pnpm build` and `pnpm typecheck` pass for all three apps

## Risks

- Free-form hex would let customers pick low-contrast colors and ship an
  accessibility failure under the EvalyCloud name. A curated set avoids this.
- Alpha utilities (`bg-primary/10`) require variables stored as RGB channels
  (`37 99 235`), not `#2563EB`. Easy to get wrong later; specify it now.
- Scope creep toward a "theme builder" — explicitly a Backlog item, not this RFC.
- **Existing defect found while checking contrast:** the Product Bible §7 accent
  `#06B6D4` scores 2.43:1 on white, and the `text-cyan-600` (`#0891B2`) currently used
  in `SectionTitle` scores 3.68:1. Both fail AA as small text today. The `ocean`
  palette corrects this to `#0E7490` (5.36:1). This is a fix, not a redesign, but it
  does change existing pixels.
- Product Bible §7 must be amended to describe `#2563EB` as the default palette
  rather than the only palette.

## Decision

**Curated palettes only.** A fixed set of pre-approved combinations, selected by name
from the content source. Free-form hex is not offered in this release and moves to
Backlog; if it is ever added it belongs to the Agency tier with a contrast check.

Rationale: contrast quality stays guaranteed, the palette count is a finite QA surface,
and "pick one of these" is a faster sales conversation than "give me your hex code".
