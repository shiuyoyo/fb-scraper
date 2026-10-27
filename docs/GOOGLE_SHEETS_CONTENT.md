# Editing your website with Google Sheets

Your website can read content from a Google Sheet you own. You edit the sheet;
the site picks up the changes on its next build. This guide is written for the
site owner, not a developer.

## What this can and cannot do

The sheet holds **public** content — the things already shown on your website:
name, intro, menu, prices, hours, announcements, FAQ, image URLs, public phone,
public address, social links.

Do **not** put anything private in the sheet: customer lists, orders, payments,
card numbers, private bookings, ID numbers, passwords, or API keys. The sheet is
published to the web to work, so treat everything in it as public.

## One-time setup

1. Make a copy of the sheet template you were given (File → Make a copy).
2. Fill in your content (see the tabs below).
3. Publish each tab: File → Share → **Publish to web** → choose the tab → choose
   **Comma-separated values (.csv)** → Publish.
4. Copy each published CSV link and send them to your developer, who wires them
   into your site's configuration once.

After that, you only ever edit the sheet — no re-publishing needed.

## The tabs

Each tab is one source and fails independently: if the menu tab has a mistake,
your hours still work.

**site** — a two-column key / value list:

| key | value |
|---|---|
| site.name | 森日蔬食 |
| hero.tagline | 讓蔬食成為每天都想吃的料理 |
| contact.phone | 07-123-4567 |

**restaurant_menu** — one row per dish; category columns repeat down the rows:

`category_id, category_name, category_description, category_sort, item_id,
item_name, item_description, price, price_label, currency, image_id, tags,
featured, new_item, sold_out, item_sort`

**opening_hours** — `day, closed, open_1, close_1, open_2, close_2, note,
sort_order`. `day` is monday…sunday.

**announcements** — `id, title, body, start_at, end_at, enabled, sort_order`.

**faq** — `id, question, answer, enabled, sort_order`.

**images** — `image_id, src, alt`. `src` is a public image URL.

## Rules that matter

- **Blank cell = keep what's there.** Leaving a cell empty does not erase the
  website's existing value; it keeps the built-in fallback.
- **To deliberately empty a field, type `__EMPTY__`.** That is the only way to
  clear something from the sheet.
- **Yes/no columns** (`sold_out`, `featured`, `enabled`): type `true` or `false`.
- **Prices**: a normal price is just a number — `280`, or `1,280` with a comma.
  For "market price" or "please ask", leave `price` blank and put the words in
  `price_label` (時價, 請洽詢, 依人數報價). Never put words in the `price` column.
- **Image URLs** must be public. If an image fails to load, the site keeps its
  built-in placeholder rather than breaking.
- **alt text**: describe each image in a few words — it helps people using
  screen readers and helps search engines.

## When changes appear

Your site is a static site, so a sheet change shows up **after the site is
rebuilt** — not the instant you save. Depending on your setup that is either a
button your developer gives you, or a scheduled rebuild. Ask your developer
which applies to you. (Editing the sheet is instant; publishing the change to
the live site is the rebuild step.)

## If something goes wrong

- **A whole tab is broken or unreachable** → the site falls back to its
  built-in content for that section. The rest of the site is unaffected.
- **One bad row** (e.g. a dish with no name) → only that row is skipped.
- **The site looks unchanged after editing** → confirm the tab is still
  published as CSV, and that a rebuild has run since your edit.
- **You accidentally deleted a column header** → the site ignores unknown
  columns and keeps the fallback; restore the header from the template copy.
