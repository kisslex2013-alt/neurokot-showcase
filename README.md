# NeuroKot Showcase (internal AI use-case marketplace)

Git-first витрина AI‑кейсов: каждый кейс описан в формате **Problem → Solution → Impact** и содержит **kit** для повторного использования.

## Structure

- `cases/<slug>/case.json` — данные кейса (валидируются по schema)
- `cases/<slug>/kit/*` — артефакты (prompts/runbooks/templates)
- `cases/schema.case.v1.json` — JSON Schema

## Commands

```bash
pnpm install
pnpm validate:cases
pnpm dev
```

## Docs

- Plan: `docs/plan.md`

## Auth / SSO

MVP может быть без auth. Для внутреннего Яндекс-контура предусмотреть интеграцию с SSO (описание будет в `docs/auth-and-sso.md`).
