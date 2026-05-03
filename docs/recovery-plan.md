# Recovery Plan

This plan keeps hotel operations moving if the app, Supabase, Vercel, or network access is unavailable.

## Manual Hotel Fallback

1. Continue check-ins manually. Do not turn guests away only because the system is down.
2. Record each guest in a temporary sheet or notebook:
   - guest name
   - phone
   - CNIC/passport status
   - room assigned
   - check-in and check-out dates
   - agreed rate
   - amount paid
   - payment method
   - booking source
   - staff member handling the case
   - issue notes
3. Save CNIC/payment proof through the normal manual channel used by staff, such as WhatsApp, but mark it as "needs upload when system returns".
4. Track room assignments on a simple room grid for the current day to avoid accidental double booking.
5. Track extra services manually on the guest row: breakfast, tea, extra bed, laundry, late checkout, damage, or other.
6. When the app returns, enter the missing records as admin-created guest records and add an internal note: "Recovered from downtime log".

## Backup And Export

- Keep Supabase production backups enabled.
- Export critical operational tables weekly or before major migrations:
  - `guest_checkins`
  - `guest_charges`
  - `guest_documents`
  - `rooms`
  - `room_maintenance_logs`
  - `expenses`
  - `audit_logs`
  - `users_profile`
- Store exports in a restricted location. Do not put CNIC, passport, or payment-proof files in broad shared drives.

## Recovery Drill

- Once per month, restore or import a recent export into staging.
- Confirm staff-critical views work: guest records, room status, folio totals, expenses, maintenance, and audit logs.
- Record any missing fields or manual steps that slowed recovery.
