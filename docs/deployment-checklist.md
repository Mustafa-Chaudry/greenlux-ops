# Deployment Checklist

Use this before shipping changes to the live GreenLux Ops system.

## Pre-deploy

- Confirm the change supports the front desk workflow and does not block check-ins unnecessarily.
- Check role impact for manager, admin, and super_admin.
- Check Supabase impact: schema, RLS, Storage, migrations, and sensitive document access.
- Run `npm run lint`.
- Run `npm run build`.
- Test the affected browser flow locally.
- Test database changes on local or staging before production.
- Confirm `.env.local` and production environment variables are present and do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Production Safety

- Deploy during a low-pressure operational window where possible.
- Keep a short rollback note: last known good deployment, migration risk, and manual workaround.
- For folio, payment, room, document, or audit changes, manually verify one realistic hotel scenario after deploy.
- Before WhatsApp or other automation work, add basic error monitoring such as Sentry for failed check-ins, folio mutations, room updates, uploads, and auth/session errors.

## Post-deploy Smoke Test

- Admin can open guest records.
- Check-in with incomplete data still remains possible with visible issues.
- Room assignment works and does not hide conflicts.
- Folio totals and paid/unpaid state are visible.
- CNIC/payment document access still respects role and Storage policies.
- Super admin can see financial and audit-sensitive areas.
