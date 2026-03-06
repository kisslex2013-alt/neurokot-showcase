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
      </header>

      <CaseBrowser cases={cases} />
    </main>
  );
}
