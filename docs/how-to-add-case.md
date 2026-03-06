# How to add a new case

Use the generator to scaffold a valid case structure.

## 1) Generate files

```bash
node scripts/new-case.mjs [slug] [options]
```

Example (explicit slug + custom prompt filename):

```bash
node scripts/new-case.mjs support-agent \
  --title "Support Agent" \
  --domain support \
  --tags support,automation \
  --nominations optimization,scalable \
  --with-prompt intake.md
```

Example (slug generated from title + starter prompt):

```bash
node scripts/new-case.mjs \
  --title "Support Agent" \
  --domain support \
  --with-prompt true
```

What gets created:

- `cases/<slug>/case.json`
- `cases/<slug>/kit/RUNBOOK.md`
- `cases/<slug>/kit/prompts/` (always created)
- optional `cases/<slug>/kit/prompts/<file>.md`

## 2) Fill in case.json

Required fields are validated by `cases/schema.case.v1.json`.
At minimum, update:

- `problem`
- `solution`
- `impact.*`
- `owner.*`
- `kit.*` links and paths

## 3) Validate locally

```bash
pnpm validate:cases
```

## 4) Preview

```bash
pnpm dev
```

Open home page, find your case using filters/search, then open details page.

## 5) Commit

```bash
git add cases/<slug> docs/how-to-add-case.md scripts/new-case.mjs
# plus any kit files you edited
git commit -m "feat: add <slug> case"
```

## CLI options

- `--title "Case title"`
- `--domain dev|ml|ops|product|support|hr|other`
- `--tags a,b,c`
- `--nominations creative,optimization,technical,scalable`
- `--with-prompt [true|false|filename.md]`
  - `--with-prompt` or `--with-prompt true` creates `prompt.md`
  - `--with-prompt false` skips prompt file
