import type { CSSProperties } from "react";
import type { EventSiteContent } from "@evalycloud/content-schema";
import type { EventLive } from "./status-types";
import { themeStyle } from "@evalycloud/config";
import { Container, CtaLink, SectionTitle } from "@evalycloud/ui";
import { resolveEventLabels } from "./labels";
import { resolveStatus, statusToneClasses } from "./status";

/**
 * Event Website Kit — Classic template.
 *
 * The baseline layout: a straightforward vertical page for talks, seminars and
 * association events. Server component, no client JavaScript; the mobile menu
 * and FAQ use native <details>.
 *
 * `live` is already-resolved data from the page, never fetched here.
 */
export function EventClassicTemplate({
  content,
  live,
}: {
  content: EventSiteContent;
  live?: EventLive;
}) {
  const { site, hero, overview, schedule, speakers, venue, announcements, faq, sponsors, contact } =
    content;
  const t = resolveEventLabels(site.language, content.labels);
  const state = resolveStatus(site.status, site.language, live?.status);

  const seatsLeft =
    live?.capacity !== undefined && live?.registered !== undefined
      ? Math.max(0, live.capacity - live.registered)
      : undefined;

  const contactMethods = [
    contact.phone && {
      label: t.phone,
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    contact.email && { label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.lineUrl && { label: t.line, value: t.line, href: contact.lineUrl },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

  const showRegistration =
    state.showRegistration && (Boolean(hero.registrationCta) || contactMethods.length > 0);

  const navLinks = [
    { id: "overview", label: t.overview },
    announcements.length > 0 && { id: "announcements", label: t.announcements },
    schedule.length > 0 && { id: "schedule", label: t.schedule },
    speakers && speakers.length > 0 && { id: "speakers", label: t.speakers },
    { id: "venue", label: t.venue },
    showRegistration && { id: "register", label: t.registration },
    faq && faq.length > 0 && { id: "faq", label: t.faq },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  const statusBadge = (
    <span
      className={`inline-flex items-center rounded-xl border px-3 py-1 text-sm font-semibold ${statusToneClasses[state.tone]}`}
    >
      {state.label}
    </span>
  );

  return (
    <div
      style={themeStyle(site.theme) as CSSProperties}
      className="bg-background text-foreground"
    >
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

            <nav aria-label={t.menu} className="hidden items-center gap-6 lg:flex">
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

              {hero.registrationCta && state.registrationActive ? (
                <CtaLink
                  href={hero.registrationCta.href}
                  className="px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
                >
                  {hero.registrationCta.label}
                </CtaLink>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      {/* Organizer-controlled banner. Deliberately above everything else. */}
      {live?.notice ? (
        <div className="border-b border-warning/50 bg-warning/10">
          <Container>
            <p className="py-3 text-sm font-medium">{live.notice}</p>
          </Container>
        </div>
      ) : null}

      <main id="main">
        <section className="py-14 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              {statusBadge}
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{hero.title}</h1>
              <p className="mt-5 text-lg text-foreground/70">{hero.subtitle}</p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <dt className="text-sm text-foreground/70">{hero.dateLabel ? "日期" : ""}</dt>
                  <dd className="mt-1 font-semibold">{hero.dateLabel}</dd>
                </div>
                <div className="rounded-xl border p-4">
                  <dt className="text-sm text-foreground/70">{t.venue}</dt>
                  <dd className="mt-1 font-semibold">{hero.locationLabel}</dd>
                </div>
              </dl>

              {state.note ? <p className="mt-6 text-foreground/70">{state.note}</p> : null}

              {seatsLeft !== undefined && !state.isArchived ? (
                <p className="mt-4 font-semibold">
                  {seatsLeft > 0
                    ? `${t.seatsLeft} ${seatsLeft} / ${live?.capacity}`
                    : t.full}
                </p>
              ) : null}

              {hero.registrationCta && state.showRegistration ? (
                <div className="mt-8">
                  {state.registrationActive ? (
                    <CtaLink href={hero.registrationCta.href}>{hero.registrationCta.label}</CtaLink>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex cursor-not-allowed items-center rounded-xl border bg-surface px-5 py-3 font-semibold text-foreground/50"
                    >
                      {hero.registrationCta.label}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        <section id="overview" className="scroll-mt-20 bg-surface py-14 sm:py-20">
          <Container>
            <SectionTitle title={overview.title} description={overview.description} />
            {overview.organizer ? (
              <p className="mt-6 text-sm text-foreground/70">
                {t.organizer}：{overview.organizer}
              </p>
            ) : null}
          </Container>
        </section>

        {announcements.length > 0 ? (
          <section id="announcements" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.announcements} />
              <ol className="mt-10 space-y-4">
                {announcements.map((item) => (
                  <li key={`${item.date}-${item.title}`} className="rounded-xl border p-5">
                    <p className="text-sm text-foreground/70">{item.date}</p>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-foreground/70">{item.body}</p>
                  </li>
                ))}
              </ol>
            </Container>
          </section>
        ) : null}

        {schedule.length > 0 ? (
          <section id="schedule" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.schedule} />
              <div className="mt-10 space-y-8">
                {schedule.map((day) => (
                  <div key={day.date} className="rounded-2xl border bg-background p-5 sm:p-6">
                    <h3 className="text-xl font-semibold">{day.label}</h3>
                    <p className="mt-1 text-sm text-foreground/70">{day.date}</p>
                    <ol className="mt-5 space-y-4">
                      {day.items.map((item) => (
                        <li
                          key={`${item.time}-${item.title}`}
                          className="flex flex-col gap-1 border-t pt-4 sm:flex-row sm:gap-6"
                        >
                          <span className="shrink-0 font-semibold text-primary sm:w-24">
                            {item.time}
                          </span>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.description ? (
                              <p className="mt-1 text-sm text-foreground/70">{item.description}</p>
                            ) : null}
                            {item.location ? (
                              <p className="mt-1 text-sm text-foreground/70">{item.location}</p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {speakers && speakers.length > 0 ? (
          <section id="speakers" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.speakers} />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {speakers.map((speaker) => (
                  <li key={speaker.name} className="rounded-2xl border p-6">
                    {speaker.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={speaker.photo.src}
                        alt={speaker.photo.alt}
                        loading="lazy"
                        decoding="async"
                        className="mb-4 aspect-square w-20 rounded-full border object-cover"
                      />
                    ) : null}
                    <h3 className="text-lg font-semibold">{speaker.name}</h3>
                    {speaker.role ? (
                      <p className="mt-1 text-sm text-accent">{speaker.role}</p>
                    ) : null}
                    {speaker.bio ? (
                      <p className="mt-3 text-sm text-foreground/70">{speaker.bio}</p>
                    ) : null}
                    {speaker.link ? (
                      <a
                        href={speaker.link.href}
                        className="mt-3 inline-block text-sm font-semibold text-primary"
                      >
                        {speaker.link.label}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        <section id="venue" className="scroll-mt-20 bg-surface py-14 sm:py-20">
          <Container>
            <SectionTitle title={t.venue} />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-background p-6">
                <h3 className="text-lg font-semibold">{venue.name}</h3>
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
                <div className="rounded-2xl border bg-background p-6">
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

        {showRegistration ? (
          <section id="register" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.registration} description={state.note || undefined} />
              {contactMethods.length > 0 ? (
                <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                  {contactMethods.map((method) => (
                    <li key={method.href}>
                      <a
                        href={method.href}
                        className="block rounded-xl border p-5 transition hover:border-primary"
                      >
                        <span className="text-sm text-foreground/70">{method.label}</span>
                        <span className="mt-1 block font-semibold text-primary">
                          {method.value}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Container>
          </section>
        ) : null}

        {faq && faq.length > 0 ? (
          <section id="faq" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.faq} />
              <div className="mx-auto mt-10 max-w-3xl space-y-3">
                {faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border bg-background p-5"
                  >
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

        {sponsors && sponsors.length > 0 ? (
          <section id="sponsors" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.sponsors} />
              <ul className="mt-10 flex flex-wrap items-center gap-6">
                {sponsors.map((sponsor) => {
                  const inner = sponsor.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logo.src}
                      alt={sponsor.logo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-semibold">{sponsor.name}</span>
                  );
                  return (
                    <li key={sponsor.name} className="rounded-xl border px-5 py-4">
                      {sponsor.tier ? (
                        <span className="mb-2 block text-xs text-foreground/70">{sponsor.tier}</span>
                      ) : null}
                      {sponsor.url ? (
                        <a href={sponsor.url} target="_blank" rel="noreferrer">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </Container>
          </section>
        ) : null}
      </main>

      <footer className={`border-t py-10 ${state.isArchived ? "bg-surface" : ""}`}>
        <Container>
          {state.isArchived ? (
            <p className="mb-6 rounded-xl border bg-background p-4 text-sm text-foreground/70">
              {state.label}｜{state.note}
            </p>
          ) : null}
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
              © {new Date().getFullYear()} {overview.organizer ?? site.name}
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
