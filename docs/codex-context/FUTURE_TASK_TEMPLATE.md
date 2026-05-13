# GreenLux Future Task Template

Use this template to start future Codex tasks without repeating the full repo history.

## Required Opening Instruction

Read the GreenLux context pack first, then inspect only the files directly relevant to this task. Do not do a full repo audit unless this task changes schema, auth/RLS, reports, payments, role access, or deployment logic.

Do not commit automatically.

## Task Name

Phase X.Y - Short task name

## Files To Inspect

- `AGENTS.md`
- `docs/codex-context/CODEX_HANDOVER.md`
- Add only task-relevant source files here.

## Objective

Describe the staff or guest workflow being improved.

## Constraints

- Do not block operations unless there is a security or data-loss risk.
- Do not change schema unless explicitly required.
- Do not change reports/payments unless explicitly required.
- Do not touch unrelated assets.
- Do not add dependencies unless clearly necessary.
- Preserve single-room stay workflows unless the task explicitly changes them.

## Acceptance Criteria

- Staff or guest workflow works end to end.
- Operational risk is visible and manageable.
- Existing critical workflows are not broken.
- Room/stay-level truth remains clear.
- Relevant validation passes.

## Relevant Validators

Choose only what applies:

- `node scripts/validate-command-centre.mjs`
- `node scripts/validate-room-reality-board.mjs`
- `node scripts/validate-guest-portal-concierge.mjs`
- `node scripts/validate-cleaning-turnover-layer.mjs`
- `node scripts/validate-phase-6-4-multi-room-bookings.mjs`
- `node scripts/validate-phase-6-5-accommodation-receipt.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

## Reporting Format

1. What changed
2. Why it is needed operationally
3. Files impacted
4. Validation results
5. Manual verification steps
6. Risks or limitations
7. Whether committed or not
