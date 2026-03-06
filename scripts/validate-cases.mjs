import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const casesDir = path.join(repoRoot, 'cases');
const schemaPath = path.join(casesDir, 'schema.case.v1.json');

async function listCaseJsonFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await listCaseJsonFiles(p));
    if (e.isFile() && e.name === 'case.json') out.push(p);
  }
  return out;
}

const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const files = await listCaseJsonFiles(casesDir);
if (files.length === 0) {
  console.error('No case.json files found under cases/.');
  process.exit(1);
}

let ok = true;
for (const f of files) {
  const data = JSON.parse(await fs.readFile(f, 'utf8'));
  const valid = validate(data);
  if (!valid) {
    ok = false;
    console.error(`\n[INVALID] ${path.relative(repoRoot, f)}`);
    console.error(validate.errors);
  }
}

if (!ok) process.exit(2);
console.log(`[OK] Validated ${files.length} case.json files.`);
