import { Container } from "@evalycloud/ui";

export default function Page() {
  return (
    <main>
      <section className="border-b">
        <Container>
          <nav className="flex h-16 items-center justify-between">
            <strong className="text-xl text-blue-600">EvalyCloud</strong>
            <span className="text-sm text-slate-500">Website Kits</span>
          </nav>
        </Container>
      </section>
      <section className="py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="font-semibold text-cyan-600">Simple tools. Real business.</p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight">
              Build professional websites without unnecessary complexity.
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Business and Event Website Kits for small businesses, organizers, and agencies.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
