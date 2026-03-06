#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const casesRoot = path.join(repoRoot, 'cases');

const ALLOWED_DOMAINS = ['dev', 'ml', 'ops', 'product', 'support', 'hr', 'other'];
const ALLOWED_NOMINATIONS = ['creative', 'optimization', 'technical', 'scalable'];

function printHelp() {
  console.log(`Usage:
  node scripts/new-case.mjs <slug> [options]

Options:
  --title "Case title"               Human readable title
  --domain <${ALLOWED_DOMAINS.join('|')}>     Case domain (default: other)
  --tags <a,b,c>                      Comma-separated tags
  --nominations <a,b>                 Comma-separated nominations
  --with-prompt [filename.md]         Create optional prompt file in kit/prompts
  --help                              Show this help

Example:
  node scripts/new-case.mjs support-agent \
    --title "Support Agent" \
    --domain support \
    --tags support,automation \
    --nominations optimization,scalable \
    --with-prompt intake.md
`);
}

function toTitleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseCsv(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getArgValue(args, key) {
  const index = args.indexOf(key);
  if (index === -1) return null;
  const next = args[index + 1];
  if (!next || next.startsWith('--')) return '';
  return next;
}

function validateSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes('--help')) {
  printHelp();
  process.exit(0);
}

const slug = argv[0];
if (!validateSlug(slug)) {
  console.error('Invalid slug. Use lowercase kebab-case (a-z, 0-9, hyphen).');
  process.exit(1);
}

const titleArg = getArgValue(argv, '--title');
const domainArg = getArgValue(argv, '--domain');
const tagsArg = getArgValue(argv, '--tags');
const nominationsArg = getArgValue(argv, '--nominations');
const promptArg = getArgValue(argv, '--with-prompt');

const title = titleArg || toTitleFromSlug(slug);
const domain = domainArg || 'other';
if (!ALLOWED_DOMAINS.includes(domain)) {
  console.error(`Invalid domain: ${domain}`);
  process.exit(1);
}

const tags = parseCsv(tagsArg);
if (tags.length === 0) {
  tags.push('new-case');
}

const nominations = parseCsv(nominationsArg);
if (nominations.length === 0) {
  nominations.push('technical');
}
for (const nomination of nominations) {
  if (!ALLOWED_NOMINATIONS.includes(nomination)) {
    console.error(`Invalid nomination: ${nomination}`);
    process.exit(1);
  }
}

const caseDir = path.join(casesRoot, slug);
const runbookPath = path.join(caseDir, 'kit', 'RUNBOOK.md');
const caseJsonPath = path.join(caseDir, 'case.json');

const promptFileName =
  argv.includes('--with-prompt') && promptArg === ''
    ? 'prompt.md'
    : promptArg || null;

if (promptFileName && !promptFileName.endsWith('.md')) {
  console.error('Prompt file must be a .md filename, e.g. summary.md');
  process.exit(1);
}

try {
  await fs.access(caseDir);
  console.error(`Case already exists: cases/${slug}`);
  process.exit(1);
} catch {
  // expected: path does not exist yet
}

await fs.mkdir(path.join(caseDir, 'kit'), { recursive: true });

const promptPack = [];
if (promptFileName) {
  const promptPath = path.join(caseDir, 'kit', 'prompts', promptFileName);
  await fs.mkdir(path.dirname(promptPath), { recursive: true });
  await fs.writeFile(
    promptPath,
    `# Prompt: ${title}\n\nDescribe the prompt intent and expected output format.\n`,
    'utf8'
  );
  promptPack.push(`cases/${slug}/kit/prompts/${promptFileName}`);
}

const casePayload = {
  id: slug,
  slug,
  title,
  domain,
  tags,
  nominations,
  problem: 'Describe the current pain point this case solves.',
  solution: 'Describe the AI-powered solution and implementation approach.',
  impact: {
    time_saved_min_per_user_per_day: 0,
    users_affected: 0,
    confidence: 'draft',
    notes: 'List assumptions and measurement plan.',
  },
  owner: {
    name: 'TBD',
    team: 'TBD',
    contact: 'TBD',
  },
  kit: {
    prompt_pack: promptPack,
    runbook: `cases/${slug}/kit/RUNBOOK.md`,
    repo_url: null,
    demo_url: null,
  },
};

await fs.writeFile(caseJsonPath, JSON.stringify(casePayload, null, 2) + '\n', 'utf8');

await fs.writeFile(
  runbookPath,
  `# ${title} — Runbook\n\n## Goal\n- What outcome should this case deliver?\n\n## Prerequisites\n- Data/tools/access needed before launch\n\n## Steps\n1. Prepare inputs\n2. Run prompts / workflow\n3. Validate output quality\n4. Share or integrate results\n\n## Risks and guardrails\n- Typical failure modes\n- Validation checklist\n\n## KPI tracking\n- Time saved (min/user/day)\n- Users affected\n- Quality / acceptance metrics\n`,
  'utf8'
);

console.log(`Created cases/${slug}/case.json`);
console.log(`Created cases/${slug}/kit/RUNBOOK.md`);
if (promptFileName) {
  console.log(`Created cases/${slug}/kit/prompts/${promptFileName}`);
}
