import Link from 'next/link';
import { listCases } from '@/lib/cases';
import { calculateImpact } from '@/lib/impact';
import CaseBrowser from '@/components/case-browser';

export default async function Home() {
  const cases = await listCases();

  const topByImpact = [...cases]
    .sort((a, b) => {
      const impactA = calculateImpact(a.impact).hours_saved_per_week_total;
      const impactB = calculateImpact(b.impact).hours_saved_per_week_total;
      return impactB - impactA;
    })
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">NeuroKot Showcase</h1>
        <p className="text-sm text-neutral-600">
          Git-first витрина AI‑кейсов: Problem → Solution → Impact + reusable kit.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/new-case"
            className="inline-flex items-center rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            New case intake
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            How to add a new case
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top by Impact</h2>
          <div className="text-xs text-neutral-500">Sorted by estimated hours saved per week</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {topByImpact.map((c) => {
            const impact = calculateImpact(c.impact);
            return (
              <Link
                key={c.slug}
                href={`/cases/${c.slug}`}
                className="rounded-lg border bg-neutral-50 p-3 hover:bg-neutral-100"
              >
                <div className="text-sm font-medium">{c.title}</div>
                <div className="mt-1 text-xs text-neutral-600">
                  {impact.hours_saved_per_week_total.toFixed(1)} h/week ·{' '}
                  {impact.minutes_saved_per_day_total.toFixed(0)} min/day total
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CaseBrowser cases={cases} />
    </main>
  );
}
