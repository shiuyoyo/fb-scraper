import type { CSSProperties } from "react";
import type { EducationSiteContent } from "@evalycloud/content-schema";
import { themeStyle } from "@evalycloud/config";
import { Container, CtaLink, SectionTitle } from "@evalycloud/ui";
import { resolveEducationLabels } from "./labels";

/**
 * Education Website Kit — Classic template.
 *
 * For a cram school, language centre, or studio. Server component, no client
 * JavaScript; mobile menu and FAQ use native <details>. Optional sections
 * (about, features, teachers, gallery, faq) vanish when empty.
 */
export function EducationClassicTemplate({ content }: { content: EducationSiteContent }) {
  const { site, hero, about, features, courses, teachers, gallery, faq, enrollment, venue, contact } = content;
  const t = resolveEducationLabels(site.language, content.labels);

  const enrollHref =
    hero.enrollCta?.href ??
    enrollment?.formUrl ??
    enrollment?.lineUrl ??
    (enrollment?.phone ? `tel:${enrollment.phone.replace(/\s/g, "")}` : undefined);

  const navLinks = [
    about && { id: "about", label: t.about },
    courses.length > 0 && { id: "courses", label: t.courses },
    features && features.length > 0 && { id: "features", label: t.features },
    teachers && teachers.length > 0 && { id: "teachers", label: t.teachers },
    gallery && gallery.length > 0 && { id: "gallery", label: t.gallery },
    faq && faq.length > 0 && { id: "faq", label: t.faq },
    { id: "enroll", label: t.enroll },
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
              {enrollHref ? (
                <CtaLink href={enrollHref} className="px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base">
                  {hero.enrollCta?.label ?? t.enrollNow}
                </CtaLink>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <main id="main">
        <section className="py-14 sm:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{hero.name}</h1>
                {hero.subtitle ? <p className="mt-2 text-lg text-foreground/60">{hero.subtitle}</p> : null}
                {hero.tagline ? <p className="mt-5 text-xl font-medium text-primary">{hero.tagline}</p> : null}
                {hero.intro ? <p className="mt-4 text-foreground/70">{hero.intro}</p> : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  <CtaLink href={hero.coursesCta?.href ?? "#courses"}>{hero.coursesCta?.label ?? t.viewCourses}</CtaLink>
                  {enrollHref ? (
                    <CtaLink href={enrollHref} variant="secondary">{hero.enrollCta?.label ?? t.enrollNow}</CtaLink>
                  ) : null}
                </div>
              </div>
              {hero.image ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hero.image.src} alt={hero.image.alt} loading="eager" decoding="async" className="aspect-[4/3] w-full rounded-2xl border object-cover" />
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        {about ? (
          <section id="about" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container><SectionTitle title={about.title} description={about.description} /></Container>
          </section>
        ) : null}

        {courses.length > 0 ? (
          <section id="courses" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.courses} />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <li key={course.id} className="flex flex-col rounded-2xl border p-6">
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    {course.audience ? <p className="mt-1 text-sm text-accent">{course.audience}</p> : null}
                    {course.description ? <p className="mt-3 text-sm text-foreground/70">{course.description}</p> : null}
                    <dl className="mt-4 space-y-1 text-sm text-foreground/70">
                      {course.schedule ? <div><dt className="inline font-medium">時間：</dt><dd className="inline">{course.schedule}</dd></div> : null}
                      {course.duration ? <div><dt className="inline font-medium">堂數：</dt><dd className="inline">{course.duration}</dd></div> : null}
                    </dl>
                    {course.priceLabel ? <p className="mt-4 font-semibold text-primary">{course.priceLabel}</p> : null}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {features && features.length > 0 ? (
          <section id="features" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.features} />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                  <li key={f.title} className="rounded-2xl border bg-background p-6">
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-foreground/70">{f.description}</p>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {teachers && teachers.length > 0 ? (
          <section id="teachers" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.teachers} />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher) => (
                  <li key={teacher.name} className="rounded-2xl border p-6">
                    {teacher.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={teacher.photo.src} alt={teacher.photo.alt} loading="lazy" decoding="async" className="mb-4 aspect-square w-20 rounded-full border object-cover" />
                    ) : null}
                    <h3 className="text-lg font-semibold">{teacher.name}</h3>
                    {teacher.title ? <p className="mt-1 text-sm text-accent">{teacher.title}</p> : null}
                    {teacher.bio ? <p className="mt-3 text-sm text-foreground/70">{teacher.bio}</p> : null}
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {teacher.subjects.map((s) => (
                          <li key={s} className="rounded border bg-surface px-1.5 py-0.5 text-xs text-foreground/70">{s}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {gallery && gallery.length > 0 ? (
          <section id="gallery" className="scroll-mt-20 bg-surface py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.gallery} />
              <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((image) => (
                  <li key={image.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-xl border object-cover" />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {faq && faq.length > 0 ? (
          <section id="faq" className="scroll-mt-20 py-14 sm:py-20">
            <Container>
              <SectionTitle title={t.faq} />
              <div className="mx-auto mt-10 max-w-3xl space-y-3">
                {faq.map((item) => (
                  <details key={item.question} className="group rounded-xl border bg-background p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <span aria-hidden="true" className="shrink-0 text-xl leading-none text-accent transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-foreground/70">{item.answer}</p>
                  </details>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        <section id="enroll" className="scroll-mt-20 bg-surface py-14 sm:py-20">
          <Container>
            <SectionTitle title={t.enroll} description={enrollment?.intro} />
            <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
              {(enrollment?.phone || contact.phone) && (
                <ReserveLink label={t.phone} value={enrollment?.phone ?? contact.phone!} href={`tel:${(enrollment?.phone ?? contact.phone!).replace(/\s/g, "")}`} />
              )}
              {(enrollment?.lineUrl || contact.lineUrl) && (
                <ReserveLink label={t.line} value="LINE" href={enrollment?.lineUrl ?? contact.lineUrl!} />
              )}
              {enrollment?.formUrl && <ReserveLink label={t.form} value={t.form} href={enrollment.formUrl} />}
              {venue?.address && <ReserveLink label={t.address} value={venue.address} href={venue.mapUrl ?? "#"} />}
            </ul>
          </Container>
        </section>
      </main>

      <footer className="border-t py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-lg">{site.name}</strong>
              <nav className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {navLinks.map((link) => (
                  <a key={link.id} href={`#${link.id}`} className="text-sm text-foreground/70 transition hover:text-foreground">{link.label}</a>
                ))}
              </nav>
            </div>
            <p className="text-sm text-foreground/70">© {new Date().getFullYear()} {site.name}</p>
          </div>
        </Container>
      </footer>
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
