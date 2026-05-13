import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const migrationPath = join(root, "supabase/migrations/20260513000000_phase_6_3_cleaning_turnover_layer.sql");
const databaseTypesPath = join(root, "src/types/database.ts");
const optionsPath = join(root, "src/lib/check-in/options.ts");
const roomsActionsPath = join(root, "src/app/admin/rooms/actions.ts");
const occupancyPagePath = join(root, "src/app/admin/occupancy/page.tsx");
const snapshotPath = join(root, "src/lib/occupancy/snapshot.ts");
const guestRecordPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const newGuestPagePath = join(root, "src/app/admin/guests/new/page.tsx");
const guestPortalPaths = [
  join(root, "src/app/dashboard/check-in/page.tsx"),
  join(root, "src/components/check-in/check-in-form.tsx"),
];

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("cleaning status is modeled on rooms without a new housekeeping table", () => {
  const migration = sourceAt(migrationPath, "Phase 6.3 cleaning migration");
  const databaseTypes = sourceAt(databaseTypesPath, "src/types/database.ts");
  const options = sourceAt(optionsPath, "src/lib/check-in/options.ts");

  assert.match(migration, /alter table public\.rooms/i, "migration must extend public.rooms");
  assert.match(migration, /room_cleaning_status/i, "migration must create the cleaning status enum");
  assert.doesNotMatch(migration, /create table/i, "Phase 6.3 must not introduce a new housekeeping table");

  for (const state of ["ready", "cleaning_required", "cleaning_in_progress", "maintenance_blocked"]) {
    assert.match(migration, new RegExp(state), `${state} missing from migration`);
    assert.match(databaseTypes, new RegExp(state), `${state} missing from generated database types`);
    assert.match(options, new RegExp(state), `${state} missing from room cleaning options`);
  }
});

test("management can update cleaning status with audit logging", () => {
  const actions = sourceAt(roomsActionsPath, "src/app/admin/rooms/actions.ts");

  assert.match(actions, /updateRoomCleaningStatus/, "cleaning status update action is missing");
  assert.match(actions, /requireRole\(managementRoles\)/, "cleaning update must preserve management role guard");
  assert.match(actions, /cleaning_status_updated_at/, "cleaning update must timestamp manual readiness changes");
  assert.match(actions, /audit_logs/, "cleaning update should use existing audit log table");
  assert.match(actions, /room_cleaning_status_updated/, "audit action name is missing");
});

test("room reality board displays explicit and inferred turnover states", () => {
  const page = sourceAt(occupancyPagePath, "src/app/admin/occupancy/page.tsx");
  const snapshot = sourceAt(snapshotPath, "src/lib/occupancy/snapshot.ts");

  for (const label of [
    "Ready",
    "Cleaning Required",
    "Cleaning In Progress",
    "Maintenance Blocked",
    "Inferred turnover needed",
    "Mark Ready",
    "Mark Cleaning Required",
    "Mark Cleaning In Progress",
    "Mark Maintenance Blocked",
  ]) {
    assert.match(page, new RegExp(label), `${label} label missing from board`);
  }

  assert.match(page, /updateRoomCleaningStatus/, "board must expose the cleaning update action");
  assert.match(snapshot, /cleaning_status/, "snapshot must fetch room cleaning status");
  assert.match(snapshot, /effectiveCleaningStatus/, "snapshot must expose effective cleaning status");
  assert.match(snapshot, /inferredTurnoverNeeded/, "snapshot must label inferred turnover separately");
});

test("room assignment warns about rooms that are not ready without blocking", () => {
  const guestRecordPage = sourceAt(guestRecordPagePath, "src/app/admin/guest-records/[id]/page.tsx");
  const newGuestPage = sourceAt(newGuestPagePath, "src/app/admin/guests/new/page.tsx");
  const combined = `${guestRecordPage}\n${newGuestPage}`;

  assert.match(
    combined,
    /Warning: this room is not marked ready\. You may continue if management has approved this\./,
    "soft room-readiness warning is missing",
  );
  assert.doesNotMatch(combined, /disabled=.*assigned_room_id|assigned_room_id.*disabled/, "room readiness must not block assignment");
});

test("guest portal does not expose cleaning controls or Wi-Fi credentials", () => {
  const guestPortalSource = guestPortalPaths.map((path) => sourceAt(path, path)).join("\n");

  assert.doesNotMatch(guestPortalSource, /cleaning_status|Mark Cleaning|Maintenance Blocked/i, "guest portal must not expose cleaning controls");
  assert.doesNotMatch(guestPortalSource, /wi-?fi\s+password|wifi\s+password|password\s*:/i, "guest portal must not expose Wi-Fi credentials");
});
