import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const guestDetailPath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const guestActionsPath = join(root, "src/app/admin/guest-records/actions.ts");
const authRolesPath = join(root, "src/lib/auth/roles.ts");
const reportsPath = join(root, "src/lib/reports/analytics.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

function correctionActionSource(source) {
  const match = source.match(/export async function saveSuperAdminGuestCorrection[\s\S]*?\n}\n\nexport async function updateGuestRecord/);
  assert.ok(match, "saveSuperAdminGuestCorrection action block is missing");
  return match[0];
}

test("Super Admin Correction Console is gated to super_admin", () => {
  const page = sourceAt(guestDetailPath, "guest detail page");
  const actions = sourceAt(guestActionsPath, "guest record actions");
  const roles = sourceAt(authRolesPath, "auth roles");

  assert.match(roles, /superAdminRoles = \["super_admin"\]/, "superAdminRoles must be defined");
  assert.match(page, /profile\.role === "super_admin"/, "Correction Console must be shown only to super_admin profile");
  assert.match(page, /Super Admin Corrections/, "Super Admin Corrections section is missing");
  assert.match(page, /Correction Console/, "Correction Console entry point is missing");
  assert.match(actions, /requireRole\(superAdminRoles\)/, "correction save action must require superAdminRoles");
  assert.doesNotMatch(actions, /saveSuperAdminGuestCorrection[\s\S]{0,120}requireRole\(managementRoles\)/, "correction save action must not use managementRoles");
});

test("Correction reason and safety warnings are required", () => {
  const page = sourceAt(guestDetailPath, "guest detail page");
  const actions = sourceAt(guestActionsPath, "guest record actions");

  assert.match(page, /name="correction_reason"[\s\S]{0,120}required/, "correction reason select must be required");
  assert.match(actions, /correction_reason: z\.enum/, "correction reason must be validated server-side");
  assert.match(actions, /Invalid super admin correction\. Correction reason is required\./, "missing correction reason error is required");
  assert.match(page, /Financial corrections affect receipts, Balance Due, and analytics\. Confirm the reason before saving\./, "financial correction warning is missing");
  assert.match(page, /Date or room corrections may create overlapping stays/, "date/room correction warning is missing");
  assert.match(page, /Save Correction/, "Save Correction button is missing");
});

test("Correction captures field-level old and new values in audit_logs", () => {
  const actions = sourceAt(guestActionsPath, "guest record actions");

  assert.match(actions, /getChangedFields/, "field-level diff helper is missing");
  assert.match(actions, /field_name/, "field name audit metadata is missing");
  assert.match(actions, /old_value/, "old value audit metadata is missing");
  assert.match(actions, /new_value/, "new value audit metadata is missing");
  assert.match(actions, /\.from\("audit_logs"\)\.insert/, "corrections must insert audit_logs");
  assert.match(actions, /action: "super_admin_guest_stay_correction"/, "correction audit action is missing");
  assert.match(actions, /actor_user_id: profile\.id/, "audit log must record changed by");
  assert.match(actions, /correction_reason/, "audit log must include correction reason");
  assert.match(actions, /correction_note/, "audit log must include optional correction note");
});

test("Correction fields cover operational, financial, verification, and lead booking context", () => {
  const page = sourceAt(guestDetailPath, "guest detail page");
  const actions = sourceAt(guestActionsPath, "guest record actions");

  for (const field of [
    "full_name",
    "phone",
    "email",
    "cnic_passport_number",
    "check_in_date",
    "check_out_date",
    "assigned_room_id",
    "booking_source",
    "number_of_guests",
    "status",
    "payment_status",
    "payment_method",
    "agreed_room_rate_pkr",
    "total_expected_amount_pkr",
    "amount_paid_pkr",
    "internal_notes",
    "booking_group_id",
    "cnic_verified",
    "payment_verified",
  ]) {
    assert.match(page, new RegExp(`name="${field}"`), `${field} correction input is missing`);
    assert.match(actions, new RegExp(field), `${field} correction handling is missing`);
  }

  assert.match(page, /Lead Booking context only\. Room\/stay financial truth remains on this Guest Stay\./, "Lead Booking context-only warning is missing");
  assert.match(actions, /lead_booking_context_only: true/, "Lead Booking context-only audit metadata is missing");
});

test("Date and room correction risk is visible without weakening existing workflows", () => {
  const actions = sourceAt(guestActionsPath, "guest record actions");

  assert.match(actions, /findUnitAssignmentConflict/, "room/date correction must check for overlap warning");
  assert.match(actions, /room_assignment_overlap_warning/, "room overlap warning must be captured in audit metadata");
  assert.match(actions, /Correction saved\. Room overlap warning/, "overlap warning must be returned to staff after save");
  assert.doesNotMatch(actions, /saveSuperAdminGuestCorrection[\s\S]{0,260}redirect\(`\/admin\/guest-records\/\$\{id\}\?message=\$\{encodeURIComponent\(formatUnitConflictMessage/, "super admin correction should not silently reuse the manager hard-block redirect");
});

test("Document security, reports, and booking group revenue truth remain unchanged", () => {
  const page = sourceAt(guestDetailPath, "guest detail page");
  const actions = sourceAt(guestActionsPath, "guest record actions");
  const correctionAction = correctionActionSource(actions);
  const reports = sourceAt(reportsPath, "reports analytics");

  assert.match(page, /short-lived signed URLs from the private storage bucket/, "signed URL security wording must remain");
  assert.doesNotMatch(correctionAction, /createSignedUrl|file_path\s*:/, "correction action must not expose or alter document storage paths");
  assert.doesNotMatch(correctionAction, /src\/lib\/reports|buildBusinessReport|createBusinessReportCsv/, "correction action must not change reports directly");
  assert.doesNotMatch(reports, /booking_groups/, "reports must not use booking_groups as revenue truth");
  assert.match(reports, /guest_checkins/, "reports must remain stay-level");
});
