import type { CSSProperties } from "react";
import type { MenuItem, RestaurantSiteContent } from "@evalycloud/content-schema";
import { themeStyle } from "@evalycloud/config";
import { formatPrice } from "@evalycloud/external-data";
import { Container, CtaLink, SectionTitle } from "@evalycloud/ui";
import { resolveRestaurantLabels, tagDisplay } from "./labels";

/**
 * Restaurant Website Kit — Classic template.
 *
 * A menu-forward single page for an independent restaurant or café. Server
 * component, no client JavaScript; the mobile menu and FAQ use native
 * <details>.
 *
 * Optional sections (about, featured, promotions, gallery, faq) vanish when
 * their content is absent, so a customer who fills in only the essentials
 * still gets a complete-looking page.
 */
export function RestaurantClassicTemplate({ content }: { content: RestaurantSiteContent }) {
  const { site, hero, about, featured, menu, promotions, openingHours, venue, reservation, gallery, faq, contact } =
    content;
  const t = resolveRestaurantLabels(site.language, content.labels);
  const currency = site.currency ?? "TWD";

  const activePromotions = (promotions ?? []).filter((p) => p.enabled !== false);

  const reserveHref =
    hero.reservationCta?.href ??
    reservation?.formUrl ??
    reservation?.platformUrl ??
    reservation?.lineUrl ??
    (reservation?.phone ? `tel:${reservation.phone.replace(/\s/g, "")}` : undefined);

  const navLinks = [
    about && { id: "about", label: t.about },
    featured && featured.length > 0 && { id: "featured", label: t.featured },
    menu.length > 0 && { id: "menu", label: t.menu },
    activePromotions.length > 0 && { id: "promotions", label: t.promotions },
    openingHours && openingHours.length > 0 && { id: "hours", label: t.hours },
    { id: "location", label: t.location },
    gallery && gallery.length > 0 && { id: "gallery", label: t.gallery },
    faq && faq.length > 0 && { id: "faq", label: t.faq },
    { id: "reservation", label: t.reservation },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <div style={themeStyle(site.theme) as CSSProperties} className="bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        {t.skip}
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <Container>
          <div className="flex min-h-16 items-center justify-between gap-3 py-2">
            <strong className="truncate text-lg">{site.name}</strong>

            <nav aria-label={t.menu} className="hidden items-center gap-5 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <details className="relative lg:hidden">
                <summary className="flex cursor-pointer list-none items-center rounded-xl border px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {t.menu}
                </summary>
                <nav
                  aria-label={t.menu}
                  className="absolute right-0 z-50 mt-2 w-52 rounded-xl border bg-background p-2 shadow-lg"
                >
                  {navLinks.map((link) => (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </details>

              {reserveHref ? (
                <CtaLink href={reserveHref} className="px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base">
                  {hero.reservationCta?.label ?? t.reserve}
                </CtaLink>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <main id="main">
        {/* 1–2. Hero */}
        <section className="py-14 sm:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{hero.name}</h1>
                {hero.subtitle ? (
                  <p className="mt-2 text-lg text-foreground/60">{hero.subtitle}</p>
                ) : null}
                {hero.tagline ? (
                  <p className="mt-5 text-xl font-medium text-primary">{hero.tagline}</p>
                ) : null}
                {hero.intro ? <p className="mt-4 text-foreground/70">{hero.intro}</p> : null}

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  {hero.areaLabel ? (
                    <div>
                      <dt className="text-foreground/60">{t.location}</dt>
                      <dd className="font-medium">{hero.areaLabel}</dd>
                    </div>
                  ) : null}
                  {hero.hoursSummary ? (
                    <div>
                      <dt className="text-foreground/60">{t.hours}</dt>
                      <dd className="font-medium">{hero.hoursSummary}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-8 flex flex-wrap gap-3">
                  {hero.menuCta ? (
                    <CtaLink href={hero.menuCta.href}>{hero.menuCta.label}</CtaLink>
                  ) : (
                    <CtaLink href="#menu">{t.viewMenu}</CtaLink>
                  )}
                  {reserveHref ? (
                    <CtaLink href={reserveHref} variant="secondary">
                      {hero.reservationCta?.label ?? t.reserve}
                    </CtaLink>
                  ) : null}
                </div>
              </div>

              {hero.image ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.image.src}
                    alt={hero.image.alt}
                    loading="eager"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-2xl border object-cover"
                  />
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        {/* 3. Introduction */}
        {about ? (
          <section id="about" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={about.title} description={about.description} />
            </Container>
          </section>
        ) : null}

        {/* 4. Featured dishes */}
        {featured && featured.length > 0 ? (
          <section id="featured" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.featured} />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((item) => (
                  <li key={item.id} className="overflow-hidden rounded-2xl border">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image.src}
                        alt={item.image.alt}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : null}
                    <div className="p-5">
                      <MenuItemRow item={item} currency={currency} language={site.language} soldOutLabel={t.soldOut} />
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* 5–6. Menu categories and items */}
        {menu.length > 0 ? (
          <section id="menu" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.menu} />
              <div className="mt-10 space-y-10">
                {menu.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    {category.description ? (
                      <p className="mt-1 text-sm text-foreground/70">{category.description}</p>
                    ) : null}
                    <ul className="mt-5 divide-y rounded-2xl border bg-background">
                      {category.items.map((item) => (
                        <li key={item.id} className="p-5">
                          <MenuItemRow
                            item={item}
                            currency={currency}
                            language={site.language}
                            soldOutLabel={t.soldOut}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {/* 7. Promotions */}
        {activePromotions.length > 0 ? (
          <section id="promotions" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.promotions} />
              <ul className="mt-10 space-y-4">
                {activePromotions.map((promo) => (
                  <li key={promo.id} className="rounded-xl border border-warning/40 bg-warning/5 p-5">
                    <h3 className="font-semibold">{promo.title}</h3>
                    {promo.body ? <p className="mt-2 text-foreground/70">{promo.body}</p> : null}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* 8. Opening hours */}
        {openingHours && openingHours.length > 0 ? (
          <section id="hours" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.hours} />
              <ul className="mx-auto mt-10 max-w-xl divide-y rounded-2xl border bg-background">
                {openingHours.map((day) => (
                  <li key={day.day} className="flex items-center justify-between gap-4 p-4">
                    <span className="font-medium">{t.days[day.day] ?? day.day}</span>
                    <span className="text-right text-foreground/70">
                      {day.closed
                        ? day.note || t.closed
                        : [
                            day.open1 && day.close1 ? `${day.open1}–${day.close1}` : "",
                            day.open2 && day.close2 ? `${day.open2}–${day.close2}` : "",
                          ]
                            .filter(Boolean)
                            .join("、") || day.note || t.closed}
                    </span>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* 9. Location / transport */}
        <section id="location" className="scroll-mt-20 py-14 sm:py-20">
          <Container>
            <SectionTitle title={t.location} />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border p-6">
                {venue.name ? <h3 className="text-lg font-semibold">{venue.name}</h3> : null}
                <p className="mt-2 text-sm text-foreground/70">
                  {t.address}：{venue.address}
                </p>
                {venue.mapUrl ? (
                  <a
                    href={venue.mapUrl}
                    className="mt-4 inline-block font-semibold text-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.map}
                  </a>
                ) : null}
              </div>
              {venue.transportNotes && venue.transportNotes.length > 0 ? (
                <div className="rounded-2xl border p-6">
                  <h3 className="text-lg font-semibold">{t.transport}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                    {venue.transportNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        {/* 11. Gallery */}
        {gallery && gallery.length > 0 ? (
          <section id="gallery" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.gallery} />
              <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((image) => (
                  <li key={image.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full rounded-xl border object-cover"
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* 12. FAQ */}
        {faq && faq.length > 0 ? (
          <section id="faq" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.faq} />
              <div className="mx-auto mt-10 max-w-3xl space-y-3">
                {faq.map((item) => (
                  <details key={item.question} className="group rounded-xl border bg-background p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-xl leading-none text-accent transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-foreground/70">{item.answer}</p>
                  </details>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {/* 10. Reservation CTA */}
        <section id="reservation" className="scroll-mt-20 bg-surface py-14 sm:py-20">
          <Container>
            <SectionTitle title={t.reservation} description={reservation?.intro} />
            <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
              {(reservation?.phone || contact.phone) && (
                <ReserveLink
                  label={t.phone}
                  value={reservation?.phone ?? contact.phone!}
                  href={`tel:${(reservation?.phone ?? contact.phone!).replace(/\s/g, "")}`}
                />
              )}
              {(reservation?.lineUrl || contact.lineUrl) && (
                <ReserveLink label={t.line} value="LINE" href={reservation?.lineUrl ?? contact.lineUrl!} />
              )}
              {reservation?.formUrl && <ReserveLink label={t.form} value={t.form} href={reservation.formUrl} />}
              {reservation?.platformUrl && (
                <ReserveLink
                  label={reservation.platformLabel ?? t.reserve}
                  value={reservation.platformLabel ?? t.reserve}
                  href={reservation.platformUrl}
                />
              )}
            </ul>
          </Container>
        </section>
      </main>

      {/* 13. Footer */}
      <footer className="border-t py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-lg">{site.name}</strong>
              <nav className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="text-sm text-foreground/70 transition hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <p className="text-sm text-foreground/70">
              © {new Date().getFullYear()} {site.name}
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

function MenuItemRow({
  item,
  currency,
  language,
  soldOutLabel,
}: {
  item: MenuItem;
  currency: string;
  language: string;
  soldOutLabel: string;
}) {
  const price = formatPrice(item, currency);
  return (
    <div className={item.soldOut ? "opacity-60" : ""}>
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-medium">
          {item.name}
          {item.soldOut ? (
            <span className="ml-2 rounded border bg-surface px-1.5 py-0.5 text-xs text-foreground/70">
              {soldOutLabel}
            </span>
          ) : null}
        </h4>
        {price ? <span className="shrink-0 font-semibold text-primary">{price}</span> : null}
      </div>
      {item.description ? <p className="mt-1 text-sm text-foreground/70">{item.description}</p> : null}
      {item.tags && item.tags.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => {
            const display = tagDisplay(tag, language);
            return (
              <li key={tag} className={`rounded border px-1.5 py-0.5 text-xs ${display.className}`}>
                {display.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ReserveLink({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <li>
      <a href={href} className="block rounded-xl border bg-background p-5 transition hover:border-primary">
        <span className="text-sm text-foreground/70">{label}</span>
        <span className="mt-1 block font-semibold text-primary">{value}</span>
      </a>
    </li>
  );
}
