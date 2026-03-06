import fs from 'node:fs/promises';
import path from 'node:path';

export type CaseV1 = {
  id: string;
  slug: string;
  title: string;
  domain: 'dev' | 'ml' | 'ops' | 'product' | 'support' | 'hr' | 'other';
  tags: string[];
  nominations: Array<'creative' | 'optimization' | 'technical' | 'scalable'>;
  problem: string;
  solution: string;
  impact: {
    time_saved_min_per_user_per_day: number;
    users_affected: number;
    confidence: 'draft' | 'measured' | 'verified';
    notes: string;
  };
  owner: {
    name: string;
    team: string;
    contact: string;
  };
  kit: {
    prompt_pack: string[];
    runbook: string;
    repo_url: string | null;
    demo_url: string | null;
  };
};

const repoRoot = process.cwd();
const casesDir = path.join(repoRoot, 'cases');

async function listCaseJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listCaseJsonFiles(p)));
    if (e.isFile() && e.name === 'case.json') out.push(p);
  }
  return out;
}

export async function listCases(): Promise<CaseV1[]> {
  const files = await listCaseJsonFiles(casesDir);
  const cases: CaseV1[] = [];
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, 'utf8')) as CaseV1;
    cases.push(data);
  }
  return cases.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCaseBySlug(slug: string): Promise<CaseV1> {
  const files = await listCaseJsonFiles(casesDir);
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, 'utf8')) as CaseV1;
    if (data.slug === slug) return data;
  }
  throw new Error(`Case not found: ${slug}`);
}
