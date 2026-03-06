import Link from 'next/link';
import { getCaseBySlug, listCases } from '@/lib/cases';

export async function generateStaticParams() {
  const cases = await listCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-semibold leading-tight">{c.title}</h1>
        <div className="mt-2 text-sm text-neutral-600">
          Domain: <span className="font-medium">{c.domain}</span> · Confidence:{' '}
          <span className="font-medium">{c.impact.confidence}</span>
        </div>
      </header>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Problem</h2>
        <p className="mt-2 text-neutral-800">{c.problem}</p>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Solution</h2>
        <p className="mt-2 text-neutral-800">{c.solution}</p>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Impact</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="text-neutral-500">Time saved</div>
            <div className="text-lg font-semibold">
              {c.impact.time_saved_min_per_user_per_day} min/user/day
            </div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="text-neutral-500">Users affected</div>
            <div className="text-lg font-semibold">{c.impact.users_affected}</div>
          </div>
        </div>
        <div className="mt-3 text-sm text-neutral-700">
          <div className="font-medium">Assumptions</div>
          <div className="mt-1 whitespace-pre-wrap">{c.impact.notes}</div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Kit</h2>
        <div className="mt-2 text-sm">
          <div>
            <span className="font-medium">Runbook:</span> <code>{c.kit.runbook}</code>
          </div>
          {c.kit.repo_url ? (
            <div className="mt-2">
              <span className="font-medium">Repo:</span>{' '}
              <a className="text-blue-600 hover:underline" href={c.kit.repo_url} target="_blank" rel="noreferrer">
                {c.kit.repo_url}
              </a>
            </div>
          ) : null}
          {c.kit.demo_url ? (
            <div className="mt-2">
              <span className="font-medium">Demo:</span>{' '}
              <a className="text-blue-600 hover:underline" href={c.kit.demo_url} target="_blank" rel="noreferrer">
                {c.kit.demo_url}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Owner</h2>
        <div className="mt-2 text-sm text-neutral-800">
          {c.owner.name} · {c.owner.team} · {c.owner.contact}
        </div>
      </section>

      <footer className="mt-10 text-xs text-neutral-500">
        MVP без авторизации. SSO будет описан в docs.
      </footer>
    </main>
  );
}
