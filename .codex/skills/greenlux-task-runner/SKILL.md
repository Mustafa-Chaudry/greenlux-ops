---
name: greenlux-task-runner
description: Default workflow for normal GreenLux implementation tasks; scopes context, preserves operational doctrine, chooses validation, and prevents unrelated churn.
---

# GreenLux Task Runner

Use this skill for normal GreenLux implementation, UI, documentation, or validation tasks.

## 1. Read First

- `AGENTS.md`
- `docs/codex-context/CODEX_HANDOVER.md`
- `docs/codex-context/FUTURE_TASK_TEMPLATE.md` when shaping a new task
- `docs/codex-context/HOSPITALITY_LANGUAGE_AND_ASSETS.md` when wording, guest-facing UI, receipts, WhatsApp, or assets are involved

## 2. Decide Scope

Inspect only task-relevant files.

Do a full repo audit only if the task changes:

- schema, migrations, RLS, Storage, auth, or role access
- reports, payments, financial calculations, receipts, or CSV exports
- deployment, environment, production recovery, or security posture
- shared operational truth such as room assignment, occupancy, or check-in lifecycle

For complex tasks, plan first and list expected files before editing.

## 3. GreenLux Doctrine

- Do not block operations. Make risk visible and manageable.
- Luxury is clarity.
- Build for non-technical hotel staff under pressure.
- Prefer admin-controlled workflows over fragile automation.
- Keep room/stay-level operational truth separate from lead booking or group context.
- Avoid premature booking engines, channel managers, AI agents, or heavy integrations.

## 4. Do Not Touch

- Do not change schema unless explicitly required.
- Do not change reports or payment calculations unless explicitly required.
- Do not touch `scripts/manual-reset-test-operational-data.sql` unless explicitly instructed.
- Do not stage unrelated assets or generated files.
- Do not add libraries unless clearly necessary.
- Do not commit automatically.
- Do not expose guest documents, payment proof, private admin links, or Wi-Fi passwords to guest/cleaner surfaces.

## 5. Validation Selection

Use the relevant feature validator when available:

- Command Centre: `node scripts/validate-command-centre.mjs`
- Room Reality Board: `node scripts/validate-room-reality-board.mjs`
- Guest portal/check-in: `node scripts/validate-guest-portal-concierge.mjs`
- Cleaning/turnover: `node scripts/validate-cleaning-turnover-layer.mjs`
- Multi-room booking: `node scripts/validate-phase-6-4-multi-room-bookings.mjs`
- Accommodation receipt: `node scripts/validate-phase-6-5-accommodation-receipt.mjs`

For source changes, normally run:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

For docs-only changes, `git diff --check` is enough.

For schema changes, recommend a future migration-safety workflow before implementation.

## 6. Commit Hygiene

- Keep commits phase-specific.
- Stage only intended files.
- Exclude reset scripts, unrelated assets, and generated churn.
- Show `git status --short` before reporting or committing.
- Commit only when explicitly instructed.

## 7. Output Format

Report:

1. Files changed
2. What changed operationally
3. Files inspected
4. Validation results
5. Manual verification steps
6. Risks or limitations
7. Whether committed or not

## Future Candidate Skills

- `greenlux-supabase-migration-safety`
- `greenlux-financial-logic-audit`
- `receipt-print-qa`
