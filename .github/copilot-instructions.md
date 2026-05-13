# GreenLux Copilot Instructions

Follow `AGENTS.md` first. For normal work, also read `docs/codex-context/CODEX_HANDOVER.md` before inspecting source files.

- Keep changes small, operationally safe, and phase-specific.
- Inspect only task-relevant files unless schema, auth/RLS, reports, payments, role access, deployment, or production recovery logic is involved.
- Do not change application logic, database schema, dependencies, assets, or generated files unless the task asks for it.
- Preserve room/stay-level truth in `guest_checkins`; `booking_groups` are lead-booking context only.
- Do not use booking group totals as revenue truth unless a future grouped reporting feature explicitly implements allocation and double-counting controls.
- Use existing scripts and helpers before inventing new abstractions.
- Run relevant validators and list exact results before saying work is complete.
- Do not commit or push unless explicitly instructed.
