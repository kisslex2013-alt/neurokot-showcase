'use client';

import { FormEvent, useMemo, useState } from 'react';

const domainOptions = ['dev', 'ml', 'ops', 'product', 'support', 'hr', 'other'] as const;
const nominationOptions = ['creative', 'optimization', 'technical', 'scalable'] as const;
const confidenceOptions = ['draft', 'measured', 'verified'] as const;

type Domain = (typeof domainOptions)[number];
type Nomination = (typeof nominationOptions)[number];
type Confidence = (typeof confidenceOptions)[number];

type GeneratedFile = {
  path: string;
  content: string;
};

type FormState = {
  title: string;
  domain: Domain;
  tags: string;
  nominations: Nomination[];
  problem: string;
  solution: string;
  time_saved_min_per_user_per_day: string;
  users_affected: string;
  confidence: Confidence;
  owner_name: string;
  owner_team: string;
  owner_contact: string;
};

const defaultFormState: FormState = {
  title: '',
  domain: 'product',
  tags: '',
  nominations: ['optimization'],
  problem: '',
  solution: '',
  time_saved_min_per_user_per_day: '15',
  users_affected: '10',
  confidence: 'draft',
  owner_name: '',
  owner_team: '',
  owner_contact: '',
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCommaList(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function prettyCaseJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function buildRunbook(params: {
  title: string;
  problem: string;
  solution: string;
  promptPath: string;
}): string {
  return `# RUNBOOK — ${params.title}\n\n## Problem\n${params.problem}\n\n## Solution\n${params.solution}\n\n## Steps\n1. Gather relevant context/data for the task.\n2. Use prompt template from \`${params.promptPath}\`.\n3. Review output with owner and iterate if needed.\n4. Roll out to target users/team and track impact weekly.\n`;
}

function buildPromptTemplate(params: {
  title: string;
  domain: string;
  problem: string;
  solution: string;
}): string {
  return `# Prompt — ${params.title}\n\n## Context\nDomain: ${params.domain}\n\nProblem:\n${params.problem}\n\nCurrent solution:\n${params.solution}\n\n## Task\nYou are an AI copilot helping to execute this case.\n\n1. Clarify ambiguous input (if needed).\n2. Produce an actionable response with concrete next steps.\n3. Keep output concise and production-ready.\n\n## Output format\n- Summary\n- Recommended actions\n- Risks / assumptions\n- Follow-up checklist\n`;
}

function FileOutput({ file }: { file: GeneratedFile }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article className="rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <code className="text-xs text-neutral-700">{file.path}</code>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-800">
        {file.content}
      </pre>
    </article>
  );
}

export default function NewCaseIntake() {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[] | null>(null);

  const slugPreview = useMemo(() => slugify(form.title) || 'your-case-slug', [form.title]);

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleNomination(value: Nomination) {
    setForm((prev) => {
      const exists = prev.nominations.includes(value);
      const next = exists
        ? prev.nominations.filter((item) => item !== value)
        : [...prev.nominations, value];
      return { ...prev, nominations: next };
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const slug = slugify(form.title);
    if (!slug) {
      setGeneratedFiles(null);
      return;
    }

    const tags = parseCommaList(form.tags);
    const timeSaved = Number(form.time_saved_min_per_user_per_day);
    const usersAffected = Number(form.users_affected);

    const basePath = `cases/${slug}`;
    const runbookPath = `${basePath}/kit/RUNBOOK.md`;
    const promptPath = `${basePath}/kit/prompts/${slug}.md`;

    const caseJson = {
      id: slug,
      slug,
      title: form.title.trim(),
      domain: form.domain,
      tags: tags.length > 0 ? tags : ['ai'],
      nominations: form.nominations.length > 0 ? form.nominations : ['optimization'],
      problem: form.problem.trim(),
      solution: form.solution.trim(),
      impact: {
        time_saved_min_per_user_per_day: Number.isFinite(timeSaved) ? timeSaved : 0,
        users_affected: Number.isFinite(usersAffected) ? Math.max(0, Math.floor(usersAffected)) : 0,
        confidence: form.confidence,
        notes: 'Generated via /new-case intake form. Validate metrics before merge.',
      },
      owner: {
        name: form.owner_name.trim() || 'TBD',
        team: form.owner_team.trim() || 'TBD',
        contact: form.owner_contact.trim() || 'TBD',
      },
      kit: {
        prompt_pack: [promptPath],
        runbook: runbookPath,
        repo_url: null,
        demo_url: null,
      },
    };

    setGeneratedFiles([
      { path: `${basePath}/case.json`, content: prettyCaseJson(caseJson) },
      {
        path: runbookPath,
        content: buildRunbook({
          title: form.title.trim(),
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          promptPath,
        }),
      },
      {
        path: promptPath,
        content: buildPromptTemplate({
          title: form.title.trim(),
          domain: form.domain,
          problem: form.problem.trim(),
          solution: form.solution.trim(),
        }),
      },
    ]);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">New case intake</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Fill the form, then copy generated files into your repo.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Title</div>
            <input
              required
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="PR review copilot"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Domain</div>
            <select
              value={form.domain}
              onChange={(event) => setField('domain', event.target.value as Domain)}
              className="w-full rounded-lg border px-3 py-2"
            >
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm md:col-span-2">
            <div className="mb-1 text-neutral-700">Tags (comma-separated)</div>
            <input
              required
              value={form.tags}
              onChange={(event) => setField('tags', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="engineering, code-review, automation"
            />
          </label>

          <fieldset className="text-sm md:col-span-2">
            <legend className="mb-2 text-neutral-700">Nominations</legend>
            <div className="flex flex-wrap gap-3">
              {nominationOptions.map((nomination) => (
                <label key={nomination} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.nominations.includes(nomination)}
                    onChange={() => toggleNomination(nomination)}
                  />
                  {nomination}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="text-sm md:col-span-2">
            <div className="mb-1 text-neutral-700">Problem</div>
            <textarea
              required
              value={form.problem}
              onChange={(event) => setField('problem', event.target.value)}
              rows={4}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="mb-1 text-neutral-700">Solution</div>
            <textarea
              required
              value={form.solution}
              onChange={(event) => setField('solution', event.target.value)}
              rows={4}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Time saved (min/user/day)</div>
            <input
              required
              type="number"
              min={0}
              value={form.time_saved_min_per_user_per_day}
              onChange={(event) => setField('time_saved_min_per_user_per_day', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Users affected</div>
            <input
              required
              type="number"
              min={0}
              value={form.users_affected}
              onChange={(event) => setField('users_affected', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Confidence</div>
            <select
              value={form.confidence}
              onChange={(event) => setField('confidence', event.target.value as Confidence)}
              className="w-full rounded-lg border px-3 py-2"
            >
              {confidenceOptions.map((confidence) => (
                <option key={confidence} value={confidence}>
                  {confidence}
                </option>
              ))}
            </select>
          </label>

          <div className="text-xs text-neutral-500 md:pt-7">Slug preview: {slugPreview}</div>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Owner name</div>
            <input
              required
              value={form.owner_name}
              onChange={(event) => setField('owner_name', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-neutral-700">Owner team</div>
            <input
              required
              value={form.owner_team}
              onChange={(event) => setField('owner_team', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="mb-1 text-neutral-700">Owner contact</div>
            <input
              required
              value={form.owner_contact}
              onChange={(event) => setField('owner_contact', event.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="@username or email"
            />
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Generate files
        </button>
      </form>

      {generatedFiles ? (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Git-first flow: create a branch, add these files to the paths above, open a PR, and merge after review.
          </div>

          {generatedFiles.map((file) => (
            <FileOutput key={file.path} file={file} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
