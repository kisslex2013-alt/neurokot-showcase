import Link from 'next/link';
import { getCaseBySlug, listCases } from '@/lib/cases';
import ConfidenceBadge from '@/components/confidence-badge';
import { IMPACT_ASSUMPTIONS, calculateImpact } from '@/lib/impact';

type CasePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ rate?: string | string[] }>;
};

function getRateParam(rateParam: string | string[] | undefined): number | null {
  const firstValue = Array.isArray(rateParam) ? rateParam[0] : rateParam;
  if (!firstValue) return null;

  const parsed = Number(firstValue);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export async function generateStaticParams() {
  const cases = await listCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export default async function CasePage({ params, searchParams }: CasePageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const hourlyRate = getRateParam(search?.rate);

  const c = await getCaseBySlug(slug);
  const calculatedImpact = calculateImpact({ ...c.impact, hourly_rate: hourlyRate });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-semibold leading-tight">{c.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span>
            Domain: <span className="font-medium">{c.domain}</span>
          </span>
          <ConfidenceBadge confidence={c.impact.confidence} />
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
            <div className="text-neutral-500">Time saved per user/day</div>
            <div className="text-lg font-semibold">
              {c.impact.time_saved_min_per_user_per_day} min/user/day
            </div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="text-neutral-500">Users affected</div>
            <div className="text-lg font-semibold">{c.impact.users_affected}</div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="text-neutral-500">Minutes saved/day (total)</div>
            <div className="text-lg font-semibold">
              {calculatedImpact.minutes_saved_per_day_total.toFixed(0)} min
            </div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="text-neutral-500">Hours saved/week (total)</div>
            <div className="text-lg font-semibold">
              {calculatedImpact.hours_saved_per_week_total.toFixed(1)} h
            </div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3 sm:col-span-2">
            <div className="text-neutral-500">Money saved/month (optional)</div>
            <div className="text-lg font-semibold">
              {calculatedImpact.money_saved_per_month === null
                ? 'Set hourly rate via ?rate=50'
                : formatMoney(calculatedImpact.money_saved_per_month)}
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-neutral-700">
          <div className="font-medium">Assumptions</div>
          <ul className="mt-1 list-disc pl-5">
            <li>{IMPACT_ASSUMPTIONS.workdaysPerWeek} workdays/week</li>
            <li>{IMPACT_ASSUMPTIONS.workdaysPerMonth} workdays/month for monthly estimate</li>
            <li>Hourly rate is optional and provided via URL query param (?rate=...)</li>
          </ul>
          <div className="mt-2 whitespace-pre-wrap">{c.impact.notes}</div>
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
