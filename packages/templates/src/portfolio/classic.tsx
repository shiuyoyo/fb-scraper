import type { CSSProperties } from "react";
import type { PortfolioSiteContent } from "@evalycloud/content-schema";
import { themeStyle } from "@evalycloud/config";
import { Container, CtaLink, SectionTitle } from "@evalycloud/ui";
import { resolvePortfolioLabels } from "./labels";

/**
 * Portfolio Website Kit — Classic template.
 *
 * Work-forward single page for a designer, photographer, or studio. Server
 * component, no client JavaScript. Optional sections (about, services,
 * clients) vanish when empty; the work grid is the spine.
 */
export function PortfolioClassicTemplate({ content }: { content: PortfolioSiteContent }) {
  const { site, hero, about, projects, services, clients, contact } = content;
  const t = resolvePortfolioLabels(site.language, content.labels);

  const sortedProjects = [...projects].sort(
    (a, b) => (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER),
  );

  const contactMethods = [
    contact.phone && { label: t.phone, value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.email && { label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.lineUrl && { label: t.line, value: t.line, href: contact.lineUrl },
    contact.instagramUrl && { label: t.instagram, value: t.instagram, href: contact.instagramUrl },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

  const navLinks = [
    projects.length > 0 && { id: "work", label: t.work },
    about && { id: "about", label: t.about },
    services && services.length > 0 && { id: "services", label: t.services },
    clients && clients.length > 0 && { id: "clients", label: t.clients },
    { id: "contact", label: t.contact },
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
                <a key={link.id} href={`#${link.id}`} className="text-sm font-medium text-foreground/70 transition hover:text-foreground">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <details className="relative lg:hidden">
                <summary className="flex cursor-pointer list-none items-center rounded-xl border px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {t.menu}
                </summary>
                <nav aria-label={t.menu} className="absolute right-0 z-50 mt-2 w-48 rounded-xl border bg-background p-2 shadow-lg">
                  {navLinks.map((link) => (
                    <a key={link.id} href={`#${link.id}`} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </details>
              <CtaLink href={hero.contactCta?.href ?? "#contact"} className="px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base">
                {hero.contactCta?.label ?? t.getInTouch}
              </CtaLink>
            </div>
          </div>
        </Container>
      </header>

      <main id="main">
        <section className="py-16 sm:py-24">
          <Container>
            <div className="max-w-3xl">
              {hero.role ? <p className="font-semibold text-accent">{hero.role}</p> : null}
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{hero.name}</h1>
              {hero.tagline ? <p className="mt-5 text-xl text-foreground/70">{hero.tagline}</p> : null}
              {hero.intro ? <p className="mt-4 text-foreground/70">{hero.intro}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink href={hero.workCta?.href ?? "#work"}>{hero.workCta?.label ?? t.viewWork}</CtaLink>
                <CtaLink href={hero.contactCta?.href ?? "#contact"} variant="secondary">
                  {hero.contactCta?.label ?? t.getInTouch}
                </CtaLink>
              </div>
            </div>
          </Container>
        </section>

        {sortedProjects.length > 0 ? (
          <section id="work" className="scroll-mt-20 py-8 sm:py-12">
            <Container>
              <SectionTitle title={t.work} />
              <ul className="mt-10 grid gap-8 sm:grid-cols-2">
                {sortedProjects.map((project) => (
                  <li key={project.id} className="group">
                    {project.cover ? (
                      <div className="overflow-hidden rounded-2xl border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.cover.src}
                          alt={project.cover.alt}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border bg-surface text-foreground/40">
                        {project.title}
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                          {project.url ? (
                            <a href={project.url.href} className="hover:text-primary" target="_blank" rel="noreferrer">
                              {project.title}
                            </a>
                          ) : (
                            project.title
                          )}
                        </h3>
                        {project.meta ? <span className="shrink-0 text-sm text-foreground/60">{project.meta}</span> : null}
                      </div>
                      {project.description ? <p className="mt-2 text-sm text-foreground/70">{project.description}</p> : null}
                      {project.tags && project.tags.length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <li key={tag} className="rounded border bg-surface px-1.5 py-0.5 text-xs text-foreground/70">{tag}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {about ? (
          <section id="about" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <SectionTitle title={about.title} description={about.description} />
                {about.image ? (
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={about.image.src} alt={about.image.alt} loading="lazy" decoding="async" className="aspect-square w-full rounded-2xl border object-cover" />
                  </div>
                ) : null}
              </div>
            </Container>
          </section>
        ) : null}

        {services && services.length > 0 ? (
          <section id="services" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.services} />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article key={service.title} className="rounded-2xl border p-6">
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="mt-2 text-foreground/70">{service.description}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {clients && clients.length > 0 ? (
          <section id="clients" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.clients} />
              <ul className="mt-10 flex flex-wrap items-center gap-6">
                {clients.map((client) => (
                  <li key={client.name} className="rounded-xl border bg-background px-5 py-4">
                    {client.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={client.logo.src} alt={client.logo.alt} loading="lazy" decoding="async" className="h-10 w-auto object-contain" />
                    ) : (
                      <span className="font-medium">{client.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        <section id="contact" className="scroll-mt-20 py-14 sm:py-20">
          <Container>
            <SectionTitle title={t.contact} />
            {contactMethods.length > 0 ? (
              <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                {contactMethods.map((method) => (
                  <li key={method.href}>
                    <a href={method.href} className="block rounded-xl border p-5 transition hover:border-primary">
                      <span className="text-sm text-foreground/70">{method.label}</span>
                      <span className="mt-1 block font-semibold text-primary">{method.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </section>
      </main>

      <footer className="border-t py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <strong className="text-lg">{site.name}</strong>
            <p className="text-sm text-foreground/70">© {new Date().getFullYear()} {site.name}</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
