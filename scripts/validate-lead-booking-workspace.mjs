import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const leadBookingPagePath = join(root, "src/app/admin/booking-groups/[id]/page.tsx");
const guestDetailPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const adminNewPagePath = join(root, "src/app/admin/guests/new/page.tsx");
const reportsPath = join(root, "src/lib/reports/analytics.ts");
const migrationPath = join(root, "supabase/migrations/20260513010000_phase_6_4_multi_room_booking_groups.sql");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("Lead Booking route and responsible booker workspace exist", () => {
  const leadBookingPage = sourceAt(leadBookingPagePath, "Lead Booking route");

  assert.match(leadBookingPage, /Lead Booking/, "Lead Booking label is missing");
  assert.match(leadBookingPage, /Lead Guest \/ Responsible Booker/, "responsible booker wording is missing");
  assert.match(leadBookingPage, /This person is responsible for the linked booking/, "responsibility wording is missing");
  assert.match(leadBookingPage, /requireRole\(managementRoles\)/, "Lead Booking route must stay protected for management roles");
  assert.match(leadBookingPage, /\.from\("booking_groups"\)\.select\("\*"\)/, "Lead Booking route must load the booking group");
  assert.match(leadBookingPage, /\.from\("guest_checkins"\)[\s\S]{0,260}\.eq\("booking_group_id", id\)/, "Lead Booking route must load linked Guest Stays");
});

test("Lead Booking shows linked room stay truth and operational action links", () => {
  const leadBookingPage = sourceAt(leadBookingPagePath, "Lead Booking route");

  assert.match(leadBookingPage, /Linked Room Stays/, "linked room stays section is missing");
  assert.match(leadBookingPage, /Room \/ Suite/, "room/suite column is missing");
  assert.match(leadBookingPage, /Stay Period/, "stay period column is missing");
  assert.match(leadBookingPage, /Rate \/ Night/, "rate/night column is missing");
  assert.match(leadBookingPage, /Expected/, "expected amount column is missing");
  assert.match(leadBookingPage, /Paid/, "paid amount column is missing");
  assert.match(leadBookingPage, /Balance Due/, "Balance Due wording is missing");
  assert.match(leadBookingPage, /ID Verification/, "ID Verification wording is missing");
  assert.match(leadBookingPage, /Payment Confirmation/, "Payment Confirmation wording is missing");
  assert.match(leadBookingPage, /Ready for Arrival/, "Ready for Arrival wording is missing");
  assert.match(leadBookingPage, /Open Guest Stay/, "Open Guest Stay action is missing");
  assert.match(leadBookingPage, /View Receipt/, "individual receipt action is missing");
  assert.match(leadBookingPage, /Print \/ Download Receipt/, "individual print/download receipt action is missing");
  assert.match(leadBookingPage, /Message Lead Guest \/ Guest/, "WhatsApp message action is missing");
});

test("Lead Booking financial summary remains derived from linked stays", () => {
  const leadBookingPage = sourceAt(leadBookingPagePath, "Lead Booking route");
  const reports = sourceAt(reportsPath, "reports analytics");

  assert.match(leadBookingPage, /Totals are derived from linked Guest Stays/, "derived totals wording is missing");
  assert.match(leadBookingPage, /getGuestFinancialSummary/, "Lead Booking must use existing stay-level financial helper");
  assert.match(leadBookingPage, /linkedTotals/, "linked stay totals must be calculated from linked stays");
  assert.match(leadBookingPage, /Total expected from linked room stays/, "expected linked stay total is missing");
  assert.match(leadBookingPage, /Total amount paid across linked room stays/, "paid linked stay total is missing");
  assert.match(leadBookingPage, /Total Balance Due across linked room stays/, "Balance Due linked stay total is missing");
  assert.match(leadBookingPage, /Total linked nights/, "total linked nights is missing");
  assert.match(leadBookingPage, /Average rate\/night/, "average rate/night is missing");
  assert.match(leadBookingPage, /Lead Booking Reference Total/, "reference total section is missing");
  assert.match(leadBookingPage, /booking_group totals are not used as revenue truth/, "reference-only wording is missing");
  assert.match(leadBookingPage, /Reports calculate revenue from individual Guest Stays to avoid double-counting/, "reporting double-counting note is missing");
  assert.doesNotMatch(reports, /booking_groups/, "reports must not use booking_groups totals");
});

test("Add Room workflow and Guest Stay backlink are wired", () => {
  const leadBookingPage = sourceAt(leadBookingPagePath, "Lead Booking route");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");
  const adminNewPage = sourceAt(adminNewPagePath, "admin new guest page");

  assert.match(leadBookingPage, /Add Room to This Lead Booking/, "Add Room action is missing");
  assert.match(leadBookingPage, /\/admin\/guests\/new\?bookingGroupId=\$\{bookingGroup\.id\}/, "Add Room action must preselect the booking group");
  assert.match(adminNewPage, /bookingGroupId/, "Add Guest Stay must accept bookingGroupId query param");
  assert.match(adminNewPage, /defaultValue=\{params\.bookingGroupId \?\? ""\}/, "Add Guest Stay must preselect existing lead booking");
  assert.match(adminNewPage, /Adding another room to Lead Booking/, "Add Guest Stay preselected lead booking note is missing");
  assert.match(guestDetailPage, /View Lead Booking/, "Guest Stay detail must link back to Lead Booking");
  assert.match(guestDetailPage, /\/admin\/booking-groups\/\$\{bookingGroup\.id\}/, "Guest Stay detail backlink URL is missing");
  assert.match(guestDetailPage, /This Guest Stay is part of a Lead Booking managed under/, "Guest Stay detail explanatory wording is missing");
});

test("Lead Booking avoids schema, tax invoice, and booking-engine overbuild", () => {
  const leadBookingPage = sourceAt(leadBookingPagePath, "Lead Booking route");
  const migration = sourceAt(migrationPath, "Phase 6.4 booking group migration");

  assert.match(migration, /create table if not exists public\.booking_groups/, "booking_groups migration must remain the existing lightweight grouping layer");
  assert.doesNotMatch(leadBookingPage, /Tax Invoice/i, "Lead Booking must not introduce Tax Invoice wording");
  assert.doesNotMatch(leadBookingPage, /View Combined Receipt|Create Combined Receipt|Print Combined Receipt/i, "Lead Booking must not build a combined receipt action");
  assert.doesNotMatch(leadBookingPage, /bulk payment allocation is available/i, "Lead Booking must not add bulk payment allocation");
  assert.match(leadBookingPage, /Bulk checkout is not available here/, "deferred bulk checkout note is missing");
  assert.match(leadBookingPage, /Bulk payment allocation is not available here/, "deferred bulk payment allocation note is missing");
  assert.match(leadBookingPage, /Combined group receipt can be added later/, "future combined receipt note is missing");
});
