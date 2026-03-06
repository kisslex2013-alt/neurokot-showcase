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
  node scripts/new-case.mjs [slug] [options]

Options:
  --title "Case title"               Human readable title
  --domain <${ALLOWED_DOMAINS.join('|')}>     Case domain (default: other)
  --tags <a,b,c>                      Comma-separated tags
  --nominations <a,b>                 Comma-separated nominations
  --with-prompt [true|false|file.md]  Create starter prompt file in kit/prompts
  --help                              Show this help

Notes:
  - If slug is omitted, it is auto-generated from --title.
  - If --with-prompt is provided without value, default is prompt.md.

Example:
  node scripts/new-case.mjs support-agent \
    --title "Support Agent" \
    --domain support \
    --tags support,automation \
    --nominations optimization,scalable \
    --with-prompt intake.md
`);
}

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
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

function validateSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function parseArgs(argv) {
  const options = {
    title: null,
    domain: null,
    tags: null,
    nominations: null,
    withPrompt: undefined,
    help: false,
  };

  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    switch (arg) {
      case '--help':
        options.help = true;
        break;
      case '--title':
      case '--domain':
      case '--tags':
      case '--nominations': {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith('--')) {
          console.error(`Missing value for ${arg}`);
          process.exit(1);
        }
        options[key] = next;
        i += 1;
        break;
      }
      case '--with-prompt': {
        const next = argv[i + 1];
        if (!next || next.startsWith('--')) {
          options.withPrompt = true;
        } else {
          options.withPrompt = next;
          i += 1;
        }
        break;
      }
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  return { options, positional };
}

const argv = process.argv.slice(2);
const { options, positional } = parseArgs(argv);

if (options.help || argv.length === 0) {
  printHelp();
  process.exit(0);
}

const providedSlug = positional[0] || null;
let slug = providedSlug ? slugify(providedSlug) : '';
if (!slug) {
  slug = slugify(options.title || '');
}
if (!slug) {
  console.error('Unable to determine slug. Provide [slug] or --title.');
  process.exit(1);
}
if (!validateSlug(slug)) {
  console.error('Invalid slug. Use lowercase kebab-case (a-z, 0-9, hyphen).');
  process.exit(1);
}

const title = options.title || toTitleFromSlug(slug);
const domain = options.domain || 'other';
if (!ALLOWED_DOMAINS.includes(domain)) {
  console.error(`Invalid domain: ${domain}`);
  process.exit(1);
}

const tags = parseCsv(options.tags);
if (tags.length === 0) {
  tags.push('new-case');
}

const nominations = parseCsv(options.nominations);
if (nominations.length === 0) {
  nominations.push('technical');
}
for (const nomination of nominations) {
  if (!ALLOWED_NOMINATIONS.includes(nomination)) {
    console.error(`Invalid nomination: ${nomination}`);
    process.exit(1);
  }
}

let promptFileName = null;
if (options.withPrompt !== undefined) {
  if (options.withPrompt === true || options.withPrompt === 'true') {
    promptFileName = 'prompt.md';
  } else if (options.withPrompt === 'false') {
    promptFileName = null;
  } else {
    promptFileName = options.withPrompt;
  }
}

if (promptFileName && !promptFileName.endsWith('.md')) {
  console.error('Prompt file must be a .md filename, e.g. summary.md');
  process.exit(1);
}

const caseDir = path.join(casesRoot, slug);
const runbookPath = path.join(caseDir, 'kit', 'RUNBOOK.md');
const caseJsonPath = path.join(caseDir, 'case.json');
const promptDir = path.join(caseDir, 'kit', 'prompts');

try {
  await fs.access(caseDir);
  console.error(`Case already exists: cases/${slug}`);
  process.exit(1);
} catch {
  // expected: path does not exist yet
}

await fs.mkdir(promptDir, { recursive: true });

const createdFiles = [];
const promptPack = [];

if (promptFileName) {
  const promptPath = path.join(promptDir, promptFileName);
  const promptRelativePath = `cases/${slug}/kit/prompts/${promptFileName}`;
  await fs.writeFile(
    promptPath,
    `# Prompt: ${title}\n\n## Goal\nDescribe the prompt intent and expected output format.\n\n## Input\n- Define expected inputs and constraints\n\n## Output\n- Define response structure and acceptance criteria\n`,
    'utf8'
  );
  createdFiles.push(promptRelativePath);
  promptPack.push(promptRelativePath);
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
createdFiles.push(`cases/${slug}/case.json`);

await fs.writeFile(
  runbookPath,
  `# ${title} — Runbook\n\n## Goal\n- What outcome should this case deliver?\n\n## Prerequisites\n- Data/tools/access needed before launch\n\n## Steps\n1. Prepare inputs\n2. Run prompts / workflow\n3. Validate output quality\n4. Share or integrate results\n\n## Risks and guardrails\n- Typical failure modes\n- Validation checklist\n\n## KPI tracking\n- Time saved (min/user/day)\n- Users affected\n- Quality / acceptance metrics\n`,
  'utf8'
);
createdFiles.push(`cases/${slug}/kit/RUNBOOK.md`);

console.log(`Created case: ${slug}`);
console.log(`Summary: ${createdFiles.length} file(s) created`);
for (const file of createdFiles) {
  console.log(`- ${file}`);
}
