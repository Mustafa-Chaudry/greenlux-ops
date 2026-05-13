import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const pagePath = join(root, "src/app/admin/command-centre/page.tsx");

function pageSource() {
  assert.equal(existsSync(pagePath), true, "src/app/admin/command-centre/page.tsx is missing");
  return readFileSync(pagePath, "utf8");
}

test("command centre reuses existing operational sources", () => {
  const source = pageSource();

  assert.match(source, /fetchOccupancySnapshot/, "must reuse occupancy snapshot");
  assert.match(source, /fetchReportInputs/, "must reuse report inputs");
  assert.match(source, /buildBusinessReport/, "must reuse report analytics");
  assert.match(source, /guest_checkins/, "must read guest_checkins");
  assert.match(source, /guest_documents/, "must account for guest_documents");
  assert.match(source, /guest_charges/, "must read folio/additional charges");
  assert.match(source, /room_maintenance_logs/, "must use existing maintenance table");
  assert.match(source, /expenses/i, "must use existing expenses table via reports");
});

test("command centre renders required action-first sections", () => {
  const source = pageSource();

  for (const section of ["Today at GreenLux", "Priority Actions", "Today Timeline", "Room Readiness", "Money Snapshot", "Quick Actions"]) {
    assert.match(source, new RegExp(section), `${section} section missing`);
  }

  for (const action of [
    "Arriving today but room not ready",
    "Departing today with Balance Due",
    "Guest Stay missing ID or Payment Confirmation",
    "Maintenance-blocked room",
    "Cleaning required",
  ]) {
    assert.match(source, new RegExp(action), `${action} action missing`);
  }
});

test("command centre surfaces the v2 operating snapshot", () => {
  const source = pageSource();

  for (const label of [
    "Arrivals Today",
    "Departures Today",
    "Rooms Needing Cleaning",
    "Rooms Not Ready",
    "Maintenance Blocked",
    "Balance Due",
    "Pending ID / Payment Confirmation",
    "Multi-room bookings needing attention",
  ]) {
    assert.match(source, new RegExp(label), `${label} snapshot metric missing`);
  }

  assert.match(source, /booking_group_id/, "multi-room attention should use the existing guest_checkins booking_group_id link");
  assert.match(source, /Ready for Arrival/, "hospitality readiness language missing");
  assert.match(source, /Needs Attention/, "hospitality attention language missing");
  assert.match(source, /Guest Stay/, "admin language should use Guest Stay");
  assert.match(source, /Payment Confirmation/, "payment language should use Payment Confirmation");
  assert.match(source, /Balance Due/, "financial language should use Balance Due");
});

test("command centre links staff to real admin fix screens", () => {
  const source = pageSource();

  for (const href of ["/admin/guest-records/", "/admin/guest-records?view=active", "/admin/guests/new", "/admin/occupancy", "/admin/maintenance"]) {
    assert.match(source, new RegExp(href.replaceAll("/", "\\/").replace("?", "\\?")), `${href} link missing`);
  }

  assert.doesNotMatch(source, /seed|fake|mock/i, "must not use fake seed data");
  assert.doesNotMatch(source, /command palette|realtime|activity feed|AI summary/i, "Phase 6.6 must not add command palettes, realtime feeds, or AI summaries");
});
