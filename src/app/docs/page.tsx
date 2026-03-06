import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';

export default async function DocsPage() {
  const howToPath = path.join(process.cwd(), 'docs', 'how-to-add-case.md');
  const howToContent = await fs.readFile(howToPath, 'utf8');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Docs</h1>
        <p className="mt-2 text-sm text-neutral-600">Project documentation for NeuroKot Showcase.</p>
      </header>

      <section className="mb-6 rounded-xl border p-4">
        <div className="mb-2 text-sm font-medium">How to add a new case</div>
        <p className="mb-3 text-sm text-neutral-600">
          Source: <code>docs/how-to-add-case.md</code>
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          ← Back to showcase
        </Link>
      </section>

      <article className="rounded-xl border bg-white p-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
          {howToContent}
        </pre>
      </article>
    </main>
  );
}
