import Link from 'next/link';
import { listCases } from '@/lib/cases';
import CaseBrowser from '@/components/case-browser';

export default async function Home() {
  const cases = await listCases();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">NeuroKot Showcase</h1>
        <p className="text-sm text-neutral-600">
          Git-first витрина AI‑кейсов: Problem → Solution → Impact + reusable kit.
        </p>
        <div className="mt-4">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            How to add a new case
          </Link>
        </div>
      </header>

      <CaseBrowser cases={cases} />
    </main>
  );
}
