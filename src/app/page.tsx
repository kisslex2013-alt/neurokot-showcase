import Link from 'next/link';
import { listCases } from '@/lib/cases';

export default async function Home() {
  const cases = await listCases();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">NeuroKot Showcase</h1>
        <p className="text-sm text-neutral-600">
          Git-first витрина AI‑кейсов: Problem → Solution → Impact + kit.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cases.map((c) => (
          <Link
            key={c.slug}
            href={`/cases/${c.slug}`}
            className="rounded-xl border p-4 hover:bg-neutral-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-medium leading-snug">{c.title}</div>
                <div className="mt-1 text-xs text-neutral-500">Domain: {c.domain}</div>
              </div>
              <div className="text-xs text-neutral-500">{c.impact.confidence}</div>
            </div>

            <div className="mt-3 text-sm text-neutral-700 line-clamp-3">{c.problem}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {c.tags.slice(0, 6).map((t) => (
                <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
