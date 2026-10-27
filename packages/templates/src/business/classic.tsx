import type { CSSProperties } from "react";
import type { BusinessSiteContent } from "@evalycloud/content-schema";
import { themeStyle } from "@evalycloud/config";
import { Container, CtaLink, SectionTitle } from "@evalycloud/ui";
import { resolveLabels } from "./labels";

/**
 * Business Website Kit template.
 *
 * Server component only — no client JavaScript is shipped. The mobile menu and
 * the FAQ accordion both use native <details>, which is keyboard accessible and
 * works with JS disabled.
 *
 * Sections backed by list content (gallery, FAQ) disappear when the list is
 * empty, so a customer without photos still gets a complete-looking site.
 */
export function BusinessClassicTemplate({ content }: { content: BusinessSiteContent }) {
  const { site, hero, about, services, gallery, faq, contact } = content;
  const t = resolveLabels(site.language, content.labels);

  const contactMethods = [
    contact.phone && {
      label: t.phone,
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    contact.email && { label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.lineUrl && { label: t.line, value: t.line, href: contact.lineUrl },
    contact.instagramUrl && { label: t.instagram, value: t.instagram, href: contact.instagramUrl },
    contact.mapUrl && { label: t.map, value: t.map, href: contact.mapUrl },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

  const navLinks = [
    { id: "about", label: about.title },
    services.length > 0 && { id: "services", label: t.services },
    gallery.length > 0 && { id: "gallery", label: t.gallery },
    faq.length > 0 && { id: "faq", label: t.faq },
    contactMethods.length > 0 && { id: "contact", label: t.contact },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

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

            <nav aria-label={t.menu} className="hidden items-center gap-6 md:flex">
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
              {navLinks.length > 0 ? (
                <details className="relative md:hidden">
                  <summary className="flex cursor-pointer list-none items-center rounded-xl border px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {t.menu}
                  </summary>
                  <nav
                    aria-label={t.menu}
                    className="absolute right-0 z-50 mt-2 w-48 rounded-xl border bg-background p-2 shadow-lg"
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
              ) : null}

              <CtaLink
                href={hero.primaryCta.href}
                className="px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
              >
                {hero.primaryCta.label}
              </CtaLink>
            </div>
          </div>
        </Container>
      </header>

      <main id="main">
        <section className="py-16 sm:py-24">
          <Container>
            <div className="max-w-3xl">
              {hero.eyebrow ? (
                <p className="font-semibold text-accent">{hero.eyebrow}</p>
              ) : null}
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {hero.title}
              </h1>
              <p className="mt-6 text-lg text-foreground/70">{hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
                {hero.secondaryCta ? (
                  <CtaLink href={hero.secondaryCta.href} variant="secondary">
                    {hero.secondaryCta.label}
                  </CtaLink>
                ) : null}
              </div>
            </div>
          </Container>
        </section>

        <section id="about" className="scroll-mt-20 bg-surface py-16 sm:py-20">
          <Container>
            <SectionTitle title={about.title} description={about.description} />
          </Container>
        </section>

        {services.length > 0 ? (
          <section id="services" className="scroll-mt-20 py-16 sm:py-20">
            <Container>
              <SectionTitle title={t.services} />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article key={service.title} className="rounded-2xl border bg-background p-6">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-3 text-foreground/70">{service.description}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section id="gallery" className="scroll-mt-20 bg-surface py-16 sm:py-20">
            <Container>
              <SectionTitle title={t.gallery} />
              <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((image) => (
                  <li key={image.src}>
                    {/* Plain <img>: customer photos come from arbitrary hosts, which
                        next/image would need per-domain configuration for. */}
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

        {faq.length > 0 ? (
          <section id="faq" className="scroll-mt-20 py-16 sm:py-20">
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

        {contactMethods.length > 0 ? (
          <section id="contact" className="scroll-mt-20 bg-surface py-16 sm:py-20">
            <Container>
              <SectionTitle title={t.contact} description={t.contactIntro} />
              <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                {contactMethods.map((method) => (
                  <li key={method.href}>
                    <a
                      href={method.href}
                      className="block rounded-xl border bg-background p-5 transition hover:border-primary"
                    >
                      <span className="text-sm text-foreground/70">{method.label}</span>
                      <span className="mt-1 block font-semibold text-primary">{method.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}
      </main>

      <footer className="border-t py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-lg">{site.name}</strong>
              {navLinks.length > 0 ? (
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
              ) : null}
            </div>
            {/* Static export freezes this at build time — rebuild yearly. */}
            <p className="text-sm text-foreground/70">
              © {new Date().getFullYear()} {site.name}
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
