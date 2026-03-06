'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CaseV1 } from '@/lib/cases';

type Props = {
  cases: CaseV1[];
};

const domainOptions: Array<{ value: CaseV1['domain'] | 'all'; label: string }> = [
  { value: 'all', label: 'All domains' },
  { value: 'dev', label: 'Dev' },
  { value: 'ml', label: 'ML' },
  { value: 'ops', label: 'Ops' },
  { value: 'product', label: 'Product' },
  { value: 'support', label: 'Support' },
  { value: 'hr', label: 'HR' },
  { value: 'other', label: 'Other' },
];

const nominationOptions: Array<{ value: CaseV1['nominations'][number] | 'all'; label: string }> = [
  { value: 'all', label: 'All nominations' },
  { value: 'creative', label: 'Creative' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'technical', label: 'Technical' },
  { value: 'scalable', label: 'Scalable' },
];

export default function CaseBrowser({ cases }: Props) {
  const [domain, setDomain] = useState<CaseV1['domain'] | 'all'>('all');
  const [nomination, setNomination] = useState<CaseV1['nominations'][number] | 'all'>('all');
  const [query, setQuery] = useState('');

  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cases.filter((c) => {
      const domainOk = domain === 'all' || c.domain === domain;
      const nominationOk = nomination === 'all' || c.nominations.includes(nomination);
      const searchOk =
        normalizedQuery.length === 0 ||
        c.title.toLowerCase().includes(normalizedQuery) ||
        c.problem.toLowerCase().includes(normalizedQuery) ||
        c.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return domainOk && nominationOk && searchOk;
    });
  }, [cases, domain, nomination, query]);

  return (
    <>
      <section className="mb-6 rounded-xl border p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Domain</div>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as CaseV1['domain'] | 'all')}
              className="w-full rounded-lg border px-3 py-2"
            >
              {domainOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Nomination</div>
            <select
              value={nomination}
              onChange={(e) =>
                setNomination(e.target.value as CaseV1['nominations'][number] | 'all')
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {nominationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Search</div>
            <input
              type="search"
              placeholder="Title, problem, tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-3 text-xs text-neutral-500">Showing {filteredCases.length} of {cases.length} cases</div>
      </section>

      {filteredCases.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredCases.map((c) => (
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
      ) : (
        <section className="rounded-xl border border-dashed p-8 text-center text-sm text-neutral-500">
          No cases match the selected filters.
        </section>
      )}
    </>
  );
}
