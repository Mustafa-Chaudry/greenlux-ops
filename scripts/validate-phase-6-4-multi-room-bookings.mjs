import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const migrationPath = join(root, "supabase/migrations/20260513010000_phase_6_4_multi_room_booking_groups.sql");
const databaseTypesPath = join(root, "src/types/database.ts");
const optionsPath = join(root, "src/lib/check-in/options.ts");
const stayDatesPath = join(root, "src/lib/check-in/stay-dates.ts");
const validationPath = join(root, "src/lib/validation/check-in.ts");
const newGuestPagePath = join(root, "src/app/admin/guests/new/page.tsx");
const newGuestActionsPath = join(root, "src/app/admin/guests/new/actions.ts");
const guestRecordPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const guestRecordActionsPath = join(root, "src/app/admin/guest-records/actions.ts");
const occupancyPagePath = join(root, "src/app/admin/occupancy/page.tsx");
const snapshotPath = join(root, "src/lib/occupancy/snapshot.ts");
const reportsPath = join(root, "src/lib/reports/analytics.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("database migration adds lightweight booking groups without replacing room-level stays", () => {
  const migration = sourceAt(migrationPath, "Phase 6.4 migration");
  const databaseTypes = sourceAt(databaseTypesPath, "src/types/database.ts");

  assert.match(migration, /create table if not exists public\.booking_groups/i, "booking_groups table is required");
  assert.match(migration, /lead_guest_name/i, "lead guest name must be stored on the group");
  assert.match(migration, /lead_guest_phone/i, "lead phone must be stored on the group");
  assert.match(migration, /expected_total_amount/i, "group expected total must be available");
  assert.match(migration, /paid_total_amount/i, "group paid total must be available");
  assert.match(migration, /alter table public\.guest_checkins[\s\S]*booking_group_id/i, "guest_checkins must link to booking_groups");
  assert.match(migration, /references public\.booking_groups\(id\) on delete set null/i, "group deletion must not delete stay history");
  assert.match(migration, /booking_groups enable row level security/i, "new public table must enable RLS");
  assert.match(migration, /Management can manage booking groups/i, "booking groups must stay management-controlled");
  assert.match(migration, /grant select, insert, update, delete on public\.booking_groups to authenticated/i, "authenticated management access grant missing");

  assert.match(databaseTypes, /booking_groups:/, "database types must include booking_groups");
  assert.match(databaseTypes, /booking_group_id: string \| null/, "guest_checkins type must include booking_group_id");
});

test("admin creation can create or attach to a lead booking group", () => {
  const page = sourceAt(newGuestPagePath, "src/app/admin/guests/new/page.tsx");
  const actions = sourceAt(newGuestActionsPath, "src/app/admin/guests/new/actions.ts");

  assert.match(page, /Multi-room booking/, "new guest form must expose multi-room booking controls");
  assert.match(page, /Create new lead booking from this stay/, "staff must be able to create a group from the first room stay");
  assert.match(page, /booking_group_id/, "new guest form must offer existing booking groups");
  assert.match(page, /formatStayRangeWithNights/, "new guest form must show stay length in group choices");
  assert.match(
    page,
    /For multi-room bookings, enter the amount for this room\/stay only\. Do not enter the full group total on every room\./,
    "new guest form must warn staff to enter per-room stay amounts",
  );
  assert.match(
    page,
    /Lead booking totals are for management reference\. Reports currently calculate revenue from individual room stays to avoid double-counting\./,
    "multi-room section must explain group totals are reference-only",
  );

  assert.match(actions, /create_new_booking_group/, "create action must parse group creation intent");
  assert.match(actions, /\.from\("booking_groups"\)\s*\.insert/, "create action must create booking groups");
  assert.match(actions, /booking_group_id: bookingGroupId/, "guest_checkins insert must persist the group link");
});

test("guest record detail shows and manages multi-room booking context", () => {
  const page = sourceAt(guestRecordPagePath, "src/app/admin/guest-records/[id]/page.tsx");
  const actions = sourceAt(guestRecordActionsPath, "src/app/admin/guest-records/actions.ts");

  assert.match(page, /Part of multi-room booking/, "guest detail must flag grouped stays");
  assert.match(page, /This room\/stay amount/, "guest detail must separate this stay's amount");
  assert.match(page, /Lead booking reference total/, "guest detail must identify group totals as reference-only");
  assert.match(page, /Linked rooms\/stays/, "guest detail must list linked stays");
  assert.match(page, /This stay expected/, "guest detail must show this stay expected amount");
  assert.match(page, /This stay paid/, "guest detail must show this stay paid amount");
  assert.match(page, /This stay outstanding/, "guest detail must show this stay outstanding amount");
  assert.match(page, /Lead expected reference/, "guest detail must show lead booking expected amount separately");
  assert.match(page, /Lead paid reference/, "guest detail must show lead booking paid amount separately");
  assert.match(page, /Lead outstanding reference/, "guest detail must show lead booking outstanding amount separately");
  assert.match(page, /Create multi-room booking from this stay/, "guest detail must allow grouping an existing stay");
  assert.match(page, /formatStayRangeWithNights/, "guest detail must show stay length");

  assert.match(actions, /createBookingGroupFromGuestRecord/, "action to create a booking group from an existing stay is required");
  assert.match(actions, /booking_group_id/, "guest update action must support attaching or detaching groups");
  assert.match(actions, /audit_logs/, "group changes should use existing audit logging where practical");
});

test("room reality board and reporting remain stay-level", () => {
  const occupancyPage = sourceAt(occupancyPagePath, "src/app/admin/occupancy/page.tsx");
  const snapshot = sourceAt(snapshotPath, "src/lib/occupancy/snapshot.ts");
  const reports = sourceAt(reportsPath, "src/lib/reports/analytics.ts");

  assert.match(occupancyPage, /snapshot\.units/, "room board must continue rendering per-room unit cards");
  assert.match(snapshot, /assigned_room_id/, "occupancy snapshot must remain room assignment based");
  assert.match(reports, /guest_checkins/, "reports must continue from stay-level guest_checkins");
  assert.doesNotMatch(reports, /booking_groups/, "Phase 6.4 must not switch reports to group-level revenue");
  assert.doesNotMatch(reports, /\.from\("booking_groups"\)/, "reports must not read group totals for revenue");
  assert.doesNotMatch(reports, /expected_total_amount|paid_total_amount/, "reports must not use booking group total column names");
});

test("booking source and stay length are available where touched", () => {
  const migration = sourceAt(migrationPath, "Phase 6.4 migration");
  const databaseTypes = sourceAt(databaseTypesPath, "src/types/database.ts");
  const options = sourceAt(optionsPath, "src/lib/check-in/options.ts");
  const validation = sourceAt(validationPath, "src/lib/validation/check-in.ts");
  const stayDates = sourceAt(stayDatesPath, "src/lib/check-in/stay-dates.ts");

  for (const source of [migration, databaseTypes, options, validation]) {
    assert.match(source, /agoda/, "Agoda must be supported as a booking source");
  }

  assert.match(stayDates, /getStayNights/, "stay length helper must exist");
  assert.match(stayDates, /formatStayRangeWithNights/, "date range must include nights");
  assert.match(stayDates, /booked nights|nights/, "stay length wording must be explicit");
});
